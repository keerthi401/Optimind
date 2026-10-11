import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient, isSupabaseConfigured, getSupabaseStatus } from '../config/supabase.js';

const TABLE_MAP = {
  User: 'users',
  Document: 'documents',
  DocumentChunk: 'document_chunks',
  Explanation: 'explanations',
  Lesson: 'lessons',
  Quiz: 'quizzes',
  QuizAttempt: 'quiz_attempts',
  Roadmap: 'roadmaps',
  LearningProgress: 'learning_progress',
  AccountDetails: 'account_details',
  UserSession: 'user_sessions',
};

/**
 * In-memory collection fallback when persistent databases are not available.
 * Provides standard Mongoose/Supabase compatible async query methods.
 */
class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.items = new Map();
  }

  async create(doc) {
    const id = doc._id || doc.id || uuidv4();
    const item = {
      _id: id,
      id: id,
      ...doc,
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date(),
    };
    this.items.set(String(id), item);
    return { ...item };
  }

  async find(filter = {}) {
    const results = [];
    for (const item of this.items.values()) {
      let matches = true;
      for (const [key, val] of Object.entries(filter)) {
        if (key === '_id' || key === 'id') {
          if (String(item._id) !== String(val) && String(item.id) !== String(val)) matches = false;
        } else if (item[key] !== val) {
          matches = false;
        }
      }
      if (matches) results.push({ ...item });
    }
    return results;
  }

  async findOne(filter = {}) {
    for (const item of this.items.values()) {
      let matches = true;
      for (const [key, val] of Object.entries(filter)) {
        if (key === '_id' || key === 'id') {
          if (String(item._id) !== String(val) && String(item.id) !== String(val)) matches = false;
        } else if (item[key] !== val) {
          matches = false;
        }
      }
      if (matches) return { ...item };
    }
    return null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const existing = await this.findById(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...update,
      updatedAt: new Date(),
    };
    this.items.set(String(id), updated);
    return { ...updated };
  }

  async deleteOne(filter = {}) {
    const item = await this.findOne(filter);
    if (item) {
      this.items.delete(String(item._id));
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(filter = {}) {
    const items = await this.find(filter);
    let count = 0;
    for (const item of items) {
      this.items.delete(String(item._id));
      count++;
    }
    return { deletedCount: count };
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }
}

export function createStore(modelName, mongooseModel) {
  const memoryStore = new InMemoryCollection(modelName);
  const tableName = TABLE_MAP[modelName] || modelName.toLowerCase();

  function shouldUseSupabase() {
    const client = getSupabaseClient();
    const status = getSupabaseStatus();
    return Boolean(client && status.connected);
  }

  function shouldUseMongoose() {
    return Boolean(mongoose.connection && mongoose.connection.readyState === 1 && mongooseModel);
  }

  return {
    async create(doc) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          const id = doc.id || doc._id || uuidv4();
          const record = { ...doc, id };
          delete record._id;
          const { data, error } = await supabase.from(tableName).insert(record).select().single();
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.create error (${error.message}). Falling back to memory.`);
            return memoryStore.create(doc);
          }
          return { ...data, _id: data.id };
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.create failed (${err.message}). Falling back to memory.`);
          return memoryStore.create(doc);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.create(doc);
      }

      return memoryStore.create(doc);
    },

    async find(filter = {}) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          let query = supabase.from(tableName).select('*');
          for (const [key, val] of Object.entries(filter)) {
            if (key === '_id' || key === 'id') {
              query = query.eq('id', val);
            } else if (val !== undefined && val !== null) {
              query = query.eq(key, val);
            }
          }
          const { data, error } = await query;
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.find error (${error.message}). Falling back to memory.`);
            return memoryStore.find(filter);
          }
          return (data || []).map((item) => ({ ...item, _id: item.id }));
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.find failed (${err.message}). Falling back to memory.`);
          return memoryStore.find(filter);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.find(filter).lean();
      }

      return memoryStore.find(filter);
    },

    async findOne(filter = {}) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          let query = supabase.from(tableName).select('*');
          for (const [key, val] of Object.entries(filter)) {
            if (key === '_id' || key === 'id') {
              query = query.eq('id', val);
            } else if (val !== undefined && val !== null) {
              query = query.eq(key, val);
            }
          }
          const { data, error } = await query.limit(1).maybeSingle();
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.findOne error (${error.message}). Falling back to memory.`);
            return memoryStore.findOne(filter);
          }
          return data ? { ...data, _id: data.id } : null;
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.findOne failed (${err.message}). Falling back to memory.`);
          return memoryStore.findOne(filter);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.findOne(filter).lean();
      }

      return memoryStore.findOne(filter);
    },

    async findById(id) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase.from(tableName).select('*').eq('id', String(id)).maybeSingle();
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.findById error (${error.message}). Falling back to memory.`);
            return memoryStore.findById(id);
          }
          return data ? { ...data, _id: data.id } : null;
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.findById failed (${err.message}). Falling back to memory.`);
          return memoryStore.findById(id);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.findById(id).lean();
      }

      return memoryStore.findById(id);
    },

    async findByIdAndUpdate(id, update, options = { new: true }) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          const cleanUpdate = { ...update, updatedAt: new Date().toISOString() };
          delete cleanUpdate._id;
          delete cleanUpdate.id;
          const { data, error } = await supabase.from(tableName).update(cleanUpdate).eq('id', String(id)).select().maybeSingle();
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.findByIdAndUpdate error (${error.message}). Falling back to memory.`);
            return memoryStore.findByIdAndUpdate(id, update, options);
          }
          return data ? { ...data, _id: data.id } : null;
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.findByIdAndUpdate failed (${err.message}). Falling back to memory.`);
          return memoryStore.findByIdAndUpdate(id, update, options);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.findByIdAndUpdate(id, update, options).lean();
      }

      return memoryStore.findByIdAndUpdate(id, update, options);
    },

    async deleteOne(filter = {}) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          const targetId = filter.id || filter._id;
          if (targetId) {
            const { error } = await supabase.from(tableName).delete().eq('id', String(targetId));
            if (!error) return { deletedCount: 1 };
          } else {
            const item = await this.findOne(filter);
            if (item) {
              const { error } = await supabase.from(tableName).delete().eq('id', String(item.id));
              if (!error) return { deletedCount: 1 };
            }
          }
          return { deletedCount: 0 };
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.deleteOne failed (${err.message}). Falling back to memory.`);
          return memoryStore.deleteOne(filter);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.deleteOne(filter);
      }

      return memoryStore.deleteOne(filter);
    },

    async deleteMany(filter = {}) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          let query = supabase.from(tableName).delete();
          for (const [key, val] of Object.entries(filter)) {
            if (key === '_id' || key === 'id') {
              query = query.eq('id', val);
            } else if (val !== undefined && val !== null) {
              query = query.eq(key, val);
            }
          }
          const { data, error } = await query.select('id');
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.deleteMany error (${error.message}). Falling back to memory.`);
            return memoryStore.deleteMany(filter);
          }
          return { deletedCount: data ? data.length : 0 };
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.deleteMany failed (${err.message}). Falling back to memory.`);
          return memoryStore.deleteMany(filter);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.deleteMany(filter);
      }

      return memoryStore.deleteMany(filter);
    },

    async countDocuments(filter = {}) {
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseClient();
          let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
          for (const [key, val] of Object.entries(filter)) {
            if (key === '_id' || key === 'id') {
              query = query.eq('id', val);
            } else if (val !== undefined && val !== null) {
              query = query.eq(key, val);
            }
          }
          const { count, error } = await query;
          if (error) {
            console.warn(`[Supabase Store Warning] ${tableName}.countDocuments error (${error.message}). Falling back to memory.`);
            return memoryStore.countDocuments(filter);
          }
          return count || 0;
        } catch (err) {
          console.warn(`[Supabase Store Warning] ${tableName}.countDocuments failed (${err.message}). Falling back to memory.`);
          return memoryStore.countDocuments(filter);
        }
      }

      if (shouldUseMongoose()) {
        return mongooseModel.countDocuments(filter);
      }

      return memoryStore.countDocuments(filter);
    },
  };
}

export default createStore;
