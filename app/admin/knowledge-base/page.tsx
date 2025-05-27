"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Plus, Upload, Edit, Trash2, Save, X, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { getAuthToken } from "@/utils/auth"

// API service for documents
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function KnowledgeBasePage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [documents, setDocuments] = useState<{ id: string; title: string; category: string; content: string; lastUpdated: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string; documentCount: number; description: string }[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<{ id: string; title: string; category: string; content: string; lastUpdated: string }[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)
  


  const getAuthHeaders = () => {
    const token = getAuthToken();
    console.log(token)
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  // Form states
  const [newDocument, setNewDocument] = useState({
    title: "",
    category: "",
    content: ""
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch documents and categories on component mount
  useEffect(() => {
    fetchDocuments()
    fetchCategories()
  }, [])

  // Update filtered documents when documents or search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.category.toLowerCase().includes(query) ||
          doc.content.toLowerCase().includes(query)
      )
      setFilteredDocuments(filtered)
    }
  }, [documents, searchQuery])

  // Fetch documents from API
  const fetchDocuments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/list`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data = await response.json()
      if (data.status && data.data.documents) {
        // Transform documents from API to match our frontend format
        interface Document {
          id: string;
          title: string;
          category: string;
          content: string;
          lastUpdated: string;
        }

        interface ApiDocument {
          id: string;
          title: string;
          category?: string;
          description?: string;
          uploaded_at: string;
        }

        const formattedDocs: Document[] = data.data.documents.map((doc: ApiDocument) => ({
          id: doc.id,
          title: doc.title,
          category: doc.category || 'Uncategorized',
          content: doc.description || '',
          lastUpdated: new Date(doc.uploaded_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        setDocuments(formattedDocs)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/categories`, {
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      if (data.status && data.data.categories) {
        // Get document counts per category
        const categoryDocCounts: Record<string, number> = {}
        documents.forEach(doc => {
          categoryDocCounts[doc.category] = (categoryDocCounts[doc.category] || 0) + 1
        })
        
        // Format categories for frontend
        interface Category {
          id: string;
          name: string;
          documentCount: number;
          description: string;
        }

        const formattedCategories: Category[] = data.data.categories.map((cat: string) => ({
          id: cat,
          name: cat,
          documentCount: categoryDocCounts[cat] || 0,
          description: `Resources related to ${cat}`
        }))
        setCategories(formattedCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Handle search input
  const handleSearch = (e: any) => {
    setSearchQuery(e.target.value)
  }

  // Start editing a document
  const startEditing = (id: string, content: string): void => {
    setEditingId(id)
    setEditContent(content)
  }

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null)
    setEditContent("")
  }

  // Save edited document
  const saveEditing = async () => {
    const docToUpdate = documents.find(doc => doc.id === editingId)
    if (!docToUpdate) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify({
          title: docToUpdate.title,
          description: editContent,
          category: docToUpdate.category
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update document')
      }
      
      // Update local state
      setDocuments(
        documents.map((doc) => (doc.id === editingId ? { ...doc, content: editContent } : doc))
      )
      
      toast({
        title: "Success",
        description: "Document updated successfully",
      })
    } catch (error) {
      console.error('Error updating document:', error)
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setEditingId(null)
      setEditContent("")
    }
  }

  // Confirm document deletion
  const confirmDelete = (id: string): void => {
    setDocumentToDelete(id)
    setShowDeleteDialog(true)
  }

  // Delete document
  const deleteDocument = async () => {
    if (!documentToDelete) return
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/${documentToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete document')
      }
      
      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentToDelete))
      
      toast({
        title: "Success",
        description: "Document deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setShowDeleteDialog(false)
      setDocumentToDelete(null)
    }
  }

  // Handle form input change
  interface InputChangeEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {}

  const handleInputChange = (e: InputChangeEvent): void => {
    const { id, value } = e.target
    setNewDocument(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle file selection
  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Upload document
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    if (!newDocument.title) {
      toast({
        title: "Error",
        description: "Please provide a document title",
        variant: "destructive"
      })
      return
    }
    
    if (!selectedFile && !newDocument.content) {
      toast({
        title: "Error",
        description: "Please provide document content or upload a file",
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    setUploadProgress(10)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('title', newDocument.title)
      formData.append('category', newDocument.category || 'General')
      
      if (selectedFile) {
        formData.append('file', selectedFile)
      } else {
        // Create a text file from the content
        const textBlob = new Blob([newDocument.content], { type: 'text/plain' })
        formData.append('file', textBlob, `${newDocument.title.replace(/\s+/g, '_')}.txt`)
      }
  
      // Get the auth token
      const authToken = localStorage.getItem('authToken')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/document/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}` // Add the authorization header
        },
        body: formData // Send FormData directly
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload document')
      }
      
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      })
      
      // Reset form and refresh documents
      setNewDocument({ title: "", category: "", content: "" })
      setSelectedFile(null)
      fetchDocuments()
      fetchCategories()
      
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Document
          </Button>
        </div>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search knowledge base..." className="pl-8" value={searchQuery} onChange={handleSearch} />
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <Badge>{doc.category}</Badge>
                    </div>
                    <CardDescription>Last updated: {doc.lastUpdated}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {editingId === doc.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground line-clamp-4">{doc.content}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {editingId === doc.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button size="sm" onClick={saveEditing}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => startEditing(doc.id, doc.content)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-destructive"
                          onClick={() => confirmDelete(doc.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground mb-4">No documents found</p>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Add your first document
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.documentCount} documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery(category.name)
                    }}
                  >
                    View Documents
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Document</CardTitle>
              <CardDescription>Add a new document to the knowledge base</CardDescription>
            </CardHeader>
            <form onSubmit={handleUpload}>
              <CardContent className="space-y-4">
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="w-full h-2" />
                    <p className="text-xs text-center text-muted-foreground">
                      {uploadProgress < 100 ? "Processing document..." : "Upload complete!"}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter document title" 
                    value={newDocument.title}
                    onChange={handleInputChange}
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newDocument.category}
                    onChange={handleInputChange}
                    disabled={isUploading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Enter document content" 
                    className="min-h-[200px]" 
                    value={newDocument.content}
                    onChange={handleInputChange}
                    disabled={isUploading || selectedFile !== null}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Or upload a file</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="file"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {selectedFile ? (
                          <>
                            <div className="flex items-center mb-2">
                              <Badge variant="outline" className="text-xs">
                                {selectedFile.name}
                              </Badge>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 ml-1"
                                onClick={() => setSelectedFile(null)}
                                disabled={isUploading}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">File selected</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, or MD (MAX. 10MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        id="file" 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange}
                        disabled={isUploading}
                        accept=".pdf,.docx,.txt,.md,.html"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setNewDocument({ title: "", category: "", content: "" })
                    setSelectedFile(null)
                  }}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUploading || (!newDocument.title || (
                    !newDocument.content && !selectedFile
                  ))}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : "Upload Document"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteDocument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}