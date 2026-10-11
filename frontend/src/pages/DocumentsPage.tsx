import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Sparkles,
  Send,
  BookOpen,
  FileSearch,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { DocumentRecord } from '../types';

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [question, setQuestion] = useState('What are the key concepts and rules described in this document?');
  const [isAsking, setIsAsking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [ragAnswer, setRagAnswer] = useState<{
    answer: string;
    sources: { docName: string; page: number; snippet: string }[];
    hasSufficientEvidence?: boolean;
  } | null>({
    answer:
      'Upload course materials (PDF, TXT, or Image) to begin asking grounded questions with verified page citations.',
    sources: [],
    hasSufficientEvidence: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.documents.list();
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
        if (res.data.length > 0 && !selectedDoc) {
          setSelectedDoc(res.data[0]);
        }
      }
    } catch (err: any) {
      console.warn('[Fetch Documents Warning]', err.message);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setError(null);
    setSuccessMsg(null);
    setIsUploading(true);

    try {
      const res = await api.documents.upload(file);
      if (res.success && res.data) {
        setSuccessMsg(`Document "${file.name}" uploaded and processed successfully!`);
        await fetchDocuments();
        setSelectedDoc(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'File upload failed. Ensure the format is PDF, TXT, PNG, or JPG.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setError(null);
    setIsAsking(true);

    try {
      const res = await api.rag.ask({
        question: question.trim(),
        documentId: selectedDoc?.id || null,
      });

      if (res.success && res.data) {
        setRagAnswer(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Could not query study materials.');
    } finally {
      setIsAsking(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.documents.delete(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
      }
      setSuccessMsg('Document deleted successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="brand" size="sm">
            Modules 04 & 05
          </Badge>
          <span className="text-xs text-slate-500 font-mono">
            Document Ingestion & Grounded RAG Assistant
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Document Library & Grounded RAG
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload class notes, slides, and textbook images. Ask questions strictly grounded in your materials with verifiable page citations.
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload Zone & Document List */}
        <div className="space-y-6">
          {/* File Upload Dropzone */}
          <Card
            onClick={() => fileInputRef.current?.click()}
            className="border-dashed border-2 border-slate-300 hover:border-brand-500 text-center p-6 cursor-pointer transition-colors bg-slate-50/50 hover:bg-white"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              className="hidden"
            />
            <div className="space-y-3">
              <div className="h-10 w-10 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {isUploading ? 'Extracting & Processing Document...' : 'Upload Educational Materials'}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click or drag and drop files here
                </p>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Supported: PDF, TXT, PNG, JPG (Max 15MB)
              </div>
              <Button variant="outline" size="sm" className="mt-1 pointer-events-none" isLoading={isUploading}>
                Browse File
              </Button>
            </div>
          </Card>

          {/* Document Inventory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span>Your Materials</span>
                <span className="text-xs font-normal text-slate-400 font-mono">
                  {documents.length} File{documents.length === 1 ? '' : 's'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {documents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No materials uploaded yet. Upload your first PDF or image notes above!
                </div>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                        <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className={`font-semibold truncate ${isSelected ? 'text-brand-900' : 'text-slate-700'}`}>
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {doc.fileType.toUpperCase()} • {Math.round(doc.sizeBytes / 1024)} KB • {doc.chunkCount} chunks
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: RAG Q&A Assistant */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  Grounded Document Assistant (RAG)
                </CardTitle>
                {selectedDoc && (
                  <Badge variant="accent" size="sm">
                    Filtering: {selectedDoc.name}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs text-slate-500">
                Responses are synthesized strictly from retrieved text chunks with source page attribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAsk} className="flex gap-2">
                <Input
                  placeholder="Ask a question about your uploaded materials..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isAsking}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Ask
                </Button>
              </form>

              {/* RAG Answer Presentation */}
              {ragAnswer && (
                <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand-800 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      Evidence-Grounded Answer
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-normal bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      {ragAnswer.answer}
                    </p>
                  </div>

                  {/* Verifiable Sources */}
                  {ragAnswer.sources && ragAnswer.sources.length > 0 && (
                    <div className="space-y-2 border-t border-slate-200/80 pt-3">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                        Retrieved Evidence Sources & Page References
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {ragAnswer.sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px] text-brand-700 font-semibold">
                              <span>📄 {src.docName}</span>
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                                Page / Section {src.page}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 italic bg-slate-50/70 p-1.5 rounded border border-slate-100 font-serif">
                              "{src.snippet}..."
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Document Extracted Snippet Preview */}
              {selectedDoc && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">
                    Selected Document Text Preview: {selectedDoc.name}
                  </h4>
                  <pre className="text-[11px] text-slate-600 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 overflow-x-auto whitespace-pre-wrap max-h-36">
                    {selectedDoc.extractedSnippet || 'Processing complete. Text indexed for retrieval.'}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
