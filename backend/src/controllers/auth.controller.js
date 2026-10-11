import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import AccountDetails from '../models/AccountDetails.js';
import { generateToken } from '../utils/token.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getSupabaseClient } from '../config/supabase.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Full name is required.' },
    });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'A valid email address is required.' },
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters.' },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: { code: 'USER_EXISTS', message: 'An account with this email address already exists.' },
    });
  }

  // Also register into Supabase Auth (auth.users)
  let supabaseUserId = null;
  const supabase = getSupabaseClient();
  if (supabase && supabase.auth) {
    try {
      // If service role is available, admin.createUser directly provisions in auth.users with no email rate limits
      if (supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
        const { data: adminData, error: adminErr } = await supabase.auth.admin.createUser({
          email: normalizedEmail,
          password: password,
          email_confirm: true,
          user_metadata: { name: name.trim() },
        });
        if (adminData?.user?.id) {
          supabaseUserId = adminData.user.id;
          console.log(`[Supabase Auth Admin] Registered user in auth.users: ${supabaseUserId}`);
        } else if (adminErr && !adminErr.message.includes('not allowed')) {
          console.warn(`[Supabase Admin Notice] ${adminErr.message}`);
        }
      }

      // Fallback to standard signUp
      if (!supabaseUserId) {
        const { data: sbData, error: sbError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });
        if (sbData?.user?.id) {
          supabaseUserId = sbData.user.id;
          console.log(`[Supabase Auth] Registered user in auth.users: ${supabaseUserId}`);
        } else if (sbError) {
          console.warn(`[Supabase Auth Notice] auth.signUp: ${sbError.message}`);
        }
      }
    } catch (sbErr) {
      console.warn(`[Supabase Auth Warning] ${sbErr.message}`);
    }
  }

  const userId = supabaseUserId || uuidv4();
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    id: userId,
    _id: userId,
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    isGuest: false,
    learningStreakDays: 1,
    totalHoursStudied: 0,
    completedLessonsCount: 0,
    averageQuizScore: 0,
  });

  const token = generateToken({
    id: newUser._id || newUser.id,
    email: newUser.email,
    name: newUser.name,
    isGuest: false,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: {
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        isGuest: false,
        learningStreakDays: newUser.learningStreakDays,
        totalHoursStudied: newUser.totalHoursStudied,
        completedLessonsCount: newUser.completedLessonsCount,
        averageQuizScore: newUser.averageQuizScore,
      },
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
    });
  }

  // Sync session in Supabase Auth if available
  const supabase = getSupabaseClient();
  if (supabase && supabase.auth) {
    try {
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
    } catch (e) {
      // Ignore background auth error to not block user
    }
  }

  const token = generateToken({
    id: user._id || user.id,
    email: user.email,
    name: user.name,
    isGuest: user.isGuest,
  });

  res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    data: {
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        learningStreakDays: user.learningStreakDays,
        totalHoursStudied: user.totalHoursStudied,
        completedLessonsCount: user.completedLessonsCount,
        averageQuizScore: user.averageQuizScore,
      },
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        isGuest: user.isGuest,
        learningStreakDays: user.learningStreakDays,
        totalHoursStudied: user.totalHoursStudied,
        completedLessonsCount: user.completedLessonsCount,
        averageQuizScore: user.averageQuizScore,
      },
    },
  });
});

export const createGuestSession = asyncHandler(async (req, res) => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const guestName = 'Guest Learner';
  const guestEmail = `${guestId}@guest.optimind.ai`;

  const dummyPassword = await bcrypt.hash(uuidv4(), 8);

  const guestUser = await User.create({
    _id: guestId,
    id: guestId,
    name: guestName,
    email: guestEmail,
    password: dummyPassword,
    isGuest: true,
    learningStreakDays: 1,
    totalHoursStudied: 0,
    completedLessonsCount: 0,
    averageQuizScore: 0,
  });

  const token = generateToken({
    id: guestId,
    email: guestEmail,
    name: guestName,
    isGuest: true,
  });

  res.status(201).json({
    success: true,
    message: 'Guest session created',
    data: {
      token,
      user: {
        id: guestId,
        name: guestName,
        email: guestEmail,
        isGuest: true,
        learningStreakDays: 1,
        totalHoursStudied: 0,
        completedLessonsCount: 0,
        averageQuizScore: 0,
      },
    },
  });
});

export const getAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User account not found.' },
    });
  }

  let details = await AccountDetails.findOne({ userId });
  if (!details) {
    details = await AccountDetails.create({
      userId,
      username: user.email ? user.email.split('@')[0] : `user_${String(userId).substring(0, 6)}`,
      institution: '',
      major: '',
      academicLevel: 'Undergraduate',
      bio: '',
      country: '',
      timezone: 'UTC',
      preferredLanguage: 'en',
      socialLinks: { github: '', linkedin: '', twitter: '', website: '' },
      learningPreferences: {
        theme: 'system',
        dailyGoalMinutes: 30,
        preferredStyle: 'visual_step_by_step',
        audioNarrationSpeed: 1.0,
        soundEffects: true,
      },
      notificationSettings: {
        emailDigest: true,
        streakReminders: true,
        quizRecommendations: true,
        productUpdates: false,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      account: {
        id: details._id || details.id,
        userId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        username: details.username,
        phoneNumber: details.phoneNumber,
        institution: details.institution,
        major: details.major,
        academicLevel: details.academicLevel,
        bio: details.bio,
        country: details.country,
        timezone: details.timezone,
        preferredLanguage: details.preferredLanguage,
        socialLinks: details.socialLinks,
        learningPreferences: details.learningPreferences,
        notificationSettings: details.notificationSettings,
        createdAt: details.createdAt,
        updatedAt: details.updatedAt,
      },
    },
  });
});

export const updateAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    username,
    phoneNumber,
    institution,
    major,
    academicLevel,
    bio,
    country,
    timezone,
    preferredLanguage,
    socialLinks,
    learningPreferences,
    notificationSettings,
    name,
    avatarUrl,
  } = req.body;

  if (name || avatarUrl !== undefined) {
    await User.findByIdAndUpdate(userId, {
      ...(name ? { name: name.trim() } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });
  }

  const updateData = {};
  if (username !== undefined) updateData.username = username.trim();
  if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
  if (institution !== undefined) updateData.institution = institution;
  if (major !== undefined) updateData.major = major;
  if (academicLevel !== undefined) updateData.academicLevel = academicLevel;
  if (bio !== undefined) updateData.bio = bio;
  if (country !== undefined) updateData.country = country;
  if (timezone !== undefined) updateData.timezone = timezone;
  if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;
  if (socialLinks !== undefined) updateData.socialLinks = socialLinks;
  if (learningPreferences !== undefined) updateData.learningPreferences = learningPreferences;
  if (notificationSettings !== undefined) updateData.notificationSettings = notificationSettings;

  let details = await AccountDetails.findOne({ userId });
  if (details) {
    details = await AccountDetails.findByIdAndUpdate(details._id || details.id, updateData, { new: true });
  } else {
    details = await AccountDetails.create({
      userId,
      ...updateData,
    });
  }

  const updatedUser = await User.findById(userId);

  res.status(200).json({
    success: true,
    message: 'Account details updated successfully',
    data: {
      account: {
        id: details._id || details.id,
        userId,
        name: updatedUser.name,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        ...details,
      },
    },
  });
});
