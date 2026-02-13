// ============================================
// EditProjectModal Component
// ============================================
// Lightweight inline editing modal for quick edits

'use client'

import { useState, useCallback, useRef } from 'react'
import { X, Upload, Loader2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { Locale } from '@/lib/i18n/config'
import { SanityProject } from '@/lib/sanity/types'
import { toast } from 'sonner'

interface EditProjectModalProps {
  project: SanityProject | null
  locale: Locale
  isOpen: boolean
  onClose: () => void
  onSave: (updatedProject: Partial<SanityProject>) => Promise<void>
}

interface FormData {
  title: Record<Locale, string>
  category: 'stone' | 'furniture'
  material: string
  summary: Record<Locale, string>
  tags: string[]
  year: number | ''
}

const materialOptions = [
  { value: 'silestone', label: 'Silestone' },
  { value: 'dekton', label: 'Dekton' },
  { value: 'granite', label: 'Granite' },
  { value: 'marble', label: 'Marble' },
  { value: 'other', label: 'Other' },
]

const tagOptions = [
  { value: 'kitchen', label: { lv: 'Virtuve', en: 'Kitchen', ru: 'Кухня' } },
  { value: 'bathroom', label: { lv: 'Vannas istaba', en: 'Bathroom', ru: 'Ванная' } },
  { value: 'living-room', label: { lv: 'Dzīvojamā istaba', en: 'Living Room', ru: 'Гостиная' } },
  { value: 'outdoor', label: { lv: 'Āra zona', en: 'Outdoor', ru: 'Улица' } },
  { value: 'commercial', label: { lv: 'Komerciāls', en: 'Commercial', ru: 'Коммерческий' } },
  { value: 'residential', label: { lv: 'Dzīvojamais', en: 'Residential', ru: 'Жилой' } },
]

export function EditProjectModal({
  project,
  locale,
  isOpen,
  onClose,
  onSave,
}: EditProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<FormData>(() => ({
    title: project?.title || { lv: '', en: '', ru: '' },
    category: project?.category || 'stone',
    material: project?.material || 'other',
    summary: project?.summary || { lv: '', en: '', ru: '' },
    tags: project?.tags || [],
    year: project?.year || new Date().getFullYear(),
  }))

  if (!isOpen || !project) return null

  const handleTitleChange = (lang: Locale, value: string) => {
    setFormData(prev => ({
      ...prev,
      title: { ...prev.title, [lang]: value },
    }))
  }

  const handleSummaryChange = (lang: Locale, value: string) => {
    setFormData(prev => ({
      ...prev,
      summary: { ...prev.summary, [lang]: value },
    }))
  }

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSave({
        title: formData.title,
        category: formData.category,
        material: formData.material as SanityProject['material'],
        summary: formData.summary,
        tags: formData.tags,
        year: formData.year || undefined,
      })
      toast.success('Project updated successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to update project')
      console.error('Update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', project._id)

      const response = await fetch('/api/projects/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      toast.success('Image uploaded successfully')
      
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      toast.error('Failed to upload image')
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-lago-dark border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-lago-dark/95 backdrop-blur-sm">
          <h2 className="text-2xl font-heading text-white">
            Edit Project
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-lago-charcoal/50 hover:bg-lago-charcoal flex items-center justify-center text-lago-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Titles Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-lago-gold uppercase tracking-wider">
              Project Title
            </h3>
            <div className="grid gap-4">
              {(['lv', 'en', 'ru'] as Locale[]).map((lang) => (
                <div key={lang}>
                  <label className="block text-xs text-lago-muted mb-1.5 uppercase">
                    {lang === 'lv' ? 'Latvian' : lang === 'en' ? 'English' : 'Russian'}
                  </label>
                  <input
                    type="text"
                    value={formData.title[lang]}
                    onChange={(e) => handleTitleChange(lang, e.target.value)}
                    className="w-full px-4 py-3 bg-lago-charcoal/50 border border-white/10 rounded-lg text-white placeholder-lago-muted focus:border-lago-gold/50 focus:ring-1 focus:ring-lago-gold/50 transition-colors outline-none"
                    placeholder={`Title in ${lang}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Category & Material */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-lago-muted mb-1.5 uppercase">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'stone' | 'furniture' }))}
                className="w-full px-4 py-3 bg-lago-charcoal/50 border border-white/10 rounded-lg text-white focus:border-lago-gold/50 focus:ring-1 focus:ring-lago-gold/50 transition-colors outline-none"
              >
                <option value="stone">Stone Surfaces</option>
                <option value="furniture">Furniture</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-lago-muted mb-1.5 uppercase">
                Material
              </label>
              <select
                value={formData.material}
                onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                className="w-full px-4 py-3 bg-lago-charcoal/50 border border-white/10 rounded-lg text-white focus:border-lago-gold/50 focus:ring-1 focus:ring-lago-gold/50 transition-colors outline-none"
              >
                {materialOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-lago-gold uppercase tracking-wider">
              Short Summary
            </h3>
            <div className="grid gap-4">
              {(['lv', 'en', 'ru'] as Locale[]).map((lang) => (
                <div key={lang}>
                  <label className="block text-xs text-lago-muted mb-1.5 uppercase">
                    {lang === 'lv' ? 'Latvian' : lang === 'en' ? 'English' : 'Russian'}
                  </label>
                  <textarea
                    value={formData.summary[lang]}
                    onChange={(e) => handleSummaryChange(lang, e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-lago-charcoal/50 border border-white/10 rounded-lg text-white placeholder-lago-muted focus:border-lago-gold/50 focus:ring-1 focus:ring-lago-gold/50 transition-colors outline-none resize-none"
                    placeholder={`Summary in ${lang}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-lago-gold uppercase tracking-wider">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => handleTagToggle(tag.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.tags.includes(tag.value)
                      ? 'bg-lago-gold text-lago-black'
                      : 'bg-lago-charcoal/50 text-lago-muted hover:text-white hover:bg-lago-charcoal'
                  }`}
                >
                  {tag.label[locale]}
                </button>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs text-lago-muted mb-1.5 uppercase">
              Year Completed
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || '' }))}
              min={2000}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 bg-lago-charcoal/50 border border-white/10 rounded-lg text-white focus:border-lago-gold/50 focus:ring-1 focus:ring-lago-gold/50 transition-colors outline-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-lago-gold uppercase tracking-wider">
              Upload Images
            </h3>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-lago-gold bg-lago-gold/5'
                  : 'border-white/20 hover:border-lago-gold/50 hover:bg-lago-charcoal/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 text-lago-gold animate-spin mx-auto" />
                  <div className="w-full h-2 bg-lago-charcoal rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lago-gold transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-lago-muted text-sm">Uploading...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-lago-charcoal/50 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-lago-gold" />
                  </div>
                  <p className="text-white font-medium mb-2">
                    Drag & drop images here
                  </p>
                  <p className="text-lago-muted text-sm">
                    or click to browse
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-lago-charcoal/50 text-white rounded-lg hover:bg-lago-charcoal transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-lago-gold text-lago-black font-medium rounded-lg hover:bg-lago-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
