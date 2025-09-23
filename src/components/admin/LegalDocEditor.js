import React, { useState, useEffect } from 'react';
import { 
  Edit, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Download,
  FileText,
  Image,
  Eye,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db, storage } from '../../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

const LegalDocEditor = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'legalDocuments'));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load legal documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDocument = async (docData) => {
    try {
      if (docData.id) {
        // Update existing document
        await updateDoc(doc(db, 'legalDocuments', docData.id), {
          ...docData,
          updatedAt: serverTimestamp()
        });
        toast.success('Document updated successfully');
      } else {
        // Add new document
        await addDoc(collection(db, 'legalDocuments'), {
          ...docData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        toast.success('Document added successfully');
      }
      loadDocuments();
      setEditingDoc(null);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const handleDeleteDocument = async (docId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // Delete document from Firestore
      await deleteDoc(doc(db, 'legalDocuments', docId));
      
      // Delete image from Storage if exists
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      }
      
      toast.success('Document deleted successfully');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleImageUpload = async (file, docId) => {
    try {
      const storageRef = ref(storage, `legal-docs/${docId}/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const DocumentEditor = ({ document, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      title: document?.title || '',
      content: document?.content || '',
      category: document?.category || 'policy',
      status: document?.status || 'draft',
      imageUrl: document?.imageUrl || '',
      ...document
    });
    const [uploading, setUploading] = useState(false);

    const handleImageChange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const imageUrl = await handleImageUpload(file, document?.id || 'temp');
      if (imageUrl) {
        setFormData({ ...formData, imageUrl });
      }
      setUploading(false);
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {document ? 'Edit Document' : 'Add New Document'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="policy">Policy</option>
                <option value="terms">Terms & Conditions</option>
                <option value="privacy">Privacy Policy</option>
                <option value="compliance">Compliance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Image
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
              </label>
              {formData.imageUrl && (
                <div className="flex items-center space-x-2">
                  <img
                    src={formData.imageUrl}
                    alt="Document"
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: '' })}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="10"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter document content..."
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-2" />
              Save Document
            </button>
          </div>
        </form>
      </div>
    );
  };

  const DocumentPreview = ({ document, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{document.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {document.imageUrl && (
            <img
              src={document.imageUrl}
              alt={document.title}
              className="w-full max-h-64 object-cover rounded-md mb-6"
            />
          )}
          
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700">
              {document.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Legal Documents</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Document</span>
        </button>
      </div>

      {editingDoc && (
        <DocumentEditor
          document={editingDoc}
          onSave={handleSaveDocument}
          onCancel={() => setEditingDoc(null)}
        />
      )}

      {showAddModal && (
        <DocumentEditor
          document={null}
          onSave={handleSaveDocument}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <div key={document.id} className="bg-white p-6 rounded-lg shadow-md">
            {document.imageUrl && (
              <img
                src={document.imageUrl}
                alt={document.title}
                className="w-full h-32 object-cover rounded-md mb-4"
              />
            )}
            
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {document.title}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  document.status === 'published' 
                    ? 'bg-green-100 text-green-800'
                    : document.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {document.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 capitalize">
                {document.category}
              </p>
              
              <p className="text-sm text-gray-500 line-clamp-3">
                {document.content}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewDoc(document)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingDoc(document)}
                    className="text-green-600 hover:text-green-800"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(document.id, document.imageUrl)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <a
                  href={`${window.location.origin}/legal/${document.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  View Live
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first legal document.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Document
          </button>
        </div>
      )}

      {previewDoc && (
        <DocumentPreview
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export default LegalDocEditor;
