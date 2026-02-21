'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { callAIAgent, uploadFiles } from '@/lib/aiAgent'
import type { ModuleOutputs } from '@/lib/aiAgent'
import { cn } from '@/lib/utils'
import {
  FiUpload,
  FiFile,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiChevronLeft,
  FiDownload,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiTarget,
  FiEdit3,
  FiFileText,
  FiCpu,
  FiToggleLeft,
  FiToggleRight,
  FiType,
  FiClipboard,
  FiZap,
  FiAward,
  FiBookOpen,
  FiStar,
  FiKey,
  FiBriefcase,
} from 'react-icons/fi'

// ---- Types ----

interface DimensionData {
  score: number
  status: string
  findings: string[]
}

interface AnalysisResult {
  overall_score: number
  summary: string
  dimensions: {
    skills: DimensionData
    experience: DimensionData
    keywords: DimensionData
    education: DimensionData
    achievements: DimensionData
  }
  gaps: string[]
  strengths: string[]
}

interface OptimizationResult {
  optimized_resume_text: string
  changes_made: string[]
  keyword_additions: string[]
  formatting_notes: string
}

// ---- Constants ----

const ANALYZER_AGENT_ID = '69996158deebc613f15864ca'
const OPTIMIZER_AGENT_ID = '69996158ceed43b6522c456c'

const THEME_VARS = {
  '--background': '0 0% 98%',
  '--foreground': '0 0% 8%',
  '--card': '0 0% 100%',
  '--card-foreground': '0 0% 8%',
  '--primary': '0 0% 8%',
  '--primary-foreground': '0 0% 98%',
  '--secondary': '0 0% 94%',
  '--secondary-foreground': '0 0% 8%',
  '--accent': '0 80% 45%',
  '--accent-foreground': '0 0% 98%',
  '--muted': '0 0% 92%',
  '--muted-foreground': '0 0% 40%',
  '--border': '0 0% 85%',
  '--input': '0 0% 80%',
} as React.CSSProperties

// ---- Sample Data ----

const SAMPLE_ANALYSIS: AnalysisResult = {
  overall_score: 72,
  summary: 'Your resume demonstrates solid technical skills and relevant experience in software engineering. However, there are notable gaps in keyword alignment with the target job description and some formatting improvements that could strengthen your candidacy.',
  dimensions: {
    skills: {
      score: 80,
      status: 'Strong',
      findings: [
        'Strong proficiency in React, TypeScript, and Node.js listed prominently',
        'Missing cloud infrastructure skills mentioned in JD (AWS, Terraform)',
        'Good alignment with frontend technology requirements',
      ],
    },
    experience: {
      score: 75,
      status: 'Moderate',
      findings: [
        'Four years of relevant experience meets the minimum requirement',
        'Leadership experience could be highlighted more prominently',
        'Quantified achievements present in most recent role only',
      ],
    },
    keywords: {
      score: 58,
      status: 'Weak',
      findings: [
        'Only 12 of 20 key terms from the JD appear in the resume',
        'Missing critical terms: CI/CD, microservices, agile methodology',
        'ATS compatibility could be significantly improved',
      ],
    },
    education: {
      score: 85,
      status: 'Strong',
      findings: [
        'BS in Computer Science aligns well with requirements',
        'Relevant certifications listed (AWS Solutions Architect)',
      ],
    },
    achievements: {
      score: 65,
      status: 'Moderate',
      findings: [
        'Revenue impact quantified in one position',
        'Missing measurable outcomes for team collaboration',
        'Consider adding specific project delivery metrics',
      ],
    },
  },
  gaps: [
    'No mention of CI/CD pipeline experience despite JD requirement',
    'Microservices architecture experience not highlighted',
    'Agile/Scrum methodology not referenced',
    'No mention of cross-functional team leadership',
  ],
  strengths: [
    'Strong alignment with core frontend technology stack',
    'Clear progression in career trajectory',
    'Quantified revenue impact in most recent role',
    'Relevant educational background with certifications',
  ],
}

const SAMPLE_OPTIMIZATION: OptimizationResult = {
  optimized_resume_text: `# ALEX MORGAN
Senior Software Engineer | San Francisco, CA
alex.morgan@email.com | linkedin.com/in/alexmorgan | github.com/alexmorgan

## PROFESSIONAL SUMMARY
Results-driven Senior Software Engineer with 4+ years of experience building scalable web applications using React, TypeScript, and Node.js. Proven track record of leading cross-functional agile teams and delivering microservices-based architectures that drove $2.3M in annual revenue growth. Experienced in CI/CD pipeline implementation and cloud infrastructure on AWS.

## TECHNICAL SKILLS
- **Frontend:** React, TypeScript, Next.js, Redux, Tailwind CSS
- **Backend:** Node.js, Python, Express, GraphQL, REST APIs
- **Cloud & DevOps:** AWS (EC2, S3, Lambda), Terraform, Docker, CI/CD (GitHub Actions, Jenkins)
- **Architecture:** Microservices, Event-driven design, Serverless
- **Methodologies:** Agile/Scrum, Test-Driven Development, Code Review

## PROFESSIONAL EXPERIENCE

### Senior Software Engineer | TechCorp Inc. | 2022 - Present
- Led a cross-functional agile team of 8 engineers to deliver a customer-facing platform that increased user engagement by 40%
- Architected and deployed microservices-based backend using Node.js and AWS Lambda, reducing server costs by 35%
- Implemented CI/CD pipelines using GitHub Actions, reducing deployment time from 2 hours to 15 minutes
- Drove $2.3M in annual revenue through performance optimizations and feature launches

### Software Engineer | StartupXYZ | 2020 - 2022
- Built responsive React/TypeScript applications serving 50,000+ daily active users
- Designed and maintained RESTful and GraphQL APIs for data-intensive features
- Collaborated in agile sprints to deliver features on 2-week release cycles
- Mentored 3 junior developers, improving team velocity by 25%

## EDUCATION
**Bachelor of Science, Computer Science** | Stanford University | 2020

## CERTIFICATIONS
- AWS Solutions Architect Associate (2023)
- Certified Scrum Master (CSM) (2022)`,
  changes_made: [
    'Added CI/CD pipeline experience to professional summary and work history',
    'Incorporated microservices architecture terminology throughout',
    'Added agile/scrum methodology references and CSM certification',
    'Quantified team collaboration with specific metrics',
    'Added cross-functional team leadership to recent role description',
    'Expanded technical skills section with DevOps and cloud tools',
    'Restructured professional summary to align with JD priorities',
  ],
  keyword_additions: [
    'CI/CD',
    'microservices',
    'agile/scrum',
    'cross-functional',
    'Terraform',
    'Docker',
    'GitHub Actions',
    'event-driven',
    'serverless',
  ],
  formatting_notes: 'Restructured the resume with a stronger professional summary that leads with quantified impact. Technical skills are now grouped by category for better ATS parsing. Work experience bullets follow the STAR method with measurable outcomes. Added Certified Scrum Master certification to address the agile methodology gap.',
}

// ---- Markdown Renderer ----

function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-bold">
        {part}
      </strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### '))
          return (
            <h4 key={i} className="font-serif font-bold text-sm mt-3 mb-1 tracking-tight">
              {line.slice(4)}
            </h4>
          )
        if (line.startsWith('## '))
          return (
            <h3 key={i} className="font-serif font-bold text-base mt-4 mb-1 tracking-tight uppercase text-[#141414]">
              {line.slice(3)}
            </h3>
          )
        if (line.startsWith('# '))
          return (
            <h2 key={i} className="font-serif font-bold text-lg mt-4 mb-2 tracking-tight">
              {line.slice(2)}
            </h2>
          )
        if (line.startsWith('- ') || line.startsWith('* '))
          return (
            <li key={i} className="ml-4 list-disc text-sm leading-relaxed">
              {formatInline(line.slice(2))}
            </li>
          )
        if (/^\d+\.\s/.test(line))
          return (
            <li key={i} className="ml-4 list-decimal text-sm leading-relaxed">
              {formatInline(line.replace(/^\d+\.\s/, ''))}
            </li>
          )
        if (!line.trim()) return <div key={i} className="h-2" />
        return (
          <p key={i} className="text-sm leading-relaxed">
            {formatInline(line)}
          </p>
        )
      })}
    </div>
  )
}

// ---- Error Boundary ----

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-[#141414]">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-serif font-bold mb-2">Something went wrong</h2>
            <p className="text-[#666666] mb-4 text-sm">{this.state.error}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: '' })}
              className="px-4 py-2 bg-[#141414] text-[#fafafa] text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---- Subcomponents ----

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { num: 1, label: 'Upload' },
    { num: 2, label: 'Score' },
    { num: 3, label: 'Result' },
  ]
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 flex items-center justify-center text-sm font-medium border border-[#d9d9d9]',
                currentStep === step.num
                  ? 'bg-[#141414] text-[#fafafa] border-[#141414]'
                  : currentStep > step.num
                    ? 'bg-[#141414] text-[#fafafa] border-[#141414]'
                    : 'bg-white text-[#666666]'
              )}
            >
              {currentStep > step.num ? (
                <FiCheckCircle className="w-4 h-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={cn(
                'text-sm tracking-tight',
                currentStep >= step.num ? 'text-[#141414] font-medium' : 'text-[#666666]'
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'w-12 h-px mx-3',
                currentStep > idx + 1 ? 'bg-[#141414]' : 'bg-[#d9d9d9]'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [animatedOffset, setAnimatedOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      const offset = circumference - (score / 100) * circumference
      setAnimatedOffset(offset)
    }, 100)
    return () => clearTimeout(timer)
  }, [score, circumference])

  const getColor = (s: number) => {
    if (s >= 80) return '#141414'
    if (s >= 60) return '#224db3'
    return '#cc1a1a'
  }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ebebeb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tracking-tight text-[#141414]">{score}</span>
        <span className="text-xs text-[#666666] tracking-tight">/100</span>
      </div>
    </div>
  )
}

function DimensionCard({ name, data, icon }: { name: string; data: DimensionData; icon: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false)
  const findings = Array.isArray(data?.findings) ? data.findings : []
  const score = data?.score ?? 0
  const status = data?.status ?? 'Unknown'

  const statusColor = (s: string) => {
    const lower = s.toLowerCase()
    if (lower === 'strong') return 'bg-[#141414] text-white'
    if (lower === 'moderate') return 'bg-[#f0f0f0] text-[#141414] border border-[#d9d9d9]'
    return 'bg-[#cc1a1a] text-white'
  }

  const barColor = (s: string) => {
    const lower = s.toLowerCase()
    if (lower === 'strong') return 'bg-[#141414]'
    if (lower === 'moderate') return 'bg-[#224db3]'
    return 'bg-[#cc1a1a]'
  }

  return (
    <div className="border border-[#d9d9d9] bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#666666]">{icon}</span>
          <h3 className="font-serif font-bold text-sm tracking-tight capitalize">{name}</h3>
        </div>
        <span className={cn('text-xs px-2 py-0.5 font-medium', statusColor(status))}>
          {status}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[#666666]">Score</span>
          <span className="text-xs font-medium text-[#141414]">{score}/100</span>
        </div>
        <div className="w-full h-2 bg-[#ebebeb]">
          <div
            className={cn('h-full transition-all duration-700 ease-out', barColor(status))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      {findings.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#666666] hover:text-[#141414] transition-colors"
          >
            {expanded ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
            {findings.length} findings
          </button>
          {expanded && (
            <ul className="mt-2 space-y-1.5">
              {findings.map((f, i) => (
                <li key={i} className="text-xs text-[#141414] leading-relaxed flex items-start gap-1.5">
                  <span className="text-[#666666] mt-0.5 shrink-0">-</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function AccordionSection({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const safeItems = Array.isArray(items) ? items : []

  if (safeItems.length === 0) return null

  return (
    <div className="border border-[#d9d9d9] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fafafa] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-[#666666]">{icon}</span>
          <span className="font-serif font-bold text-sm tracking-tight">{title}</span>
          <span className="text-xs text-[#666666] ml-1">({safeItems.length})</span>
        </div>
        {open ? <FiChevronUp className="w-4 h-4 text-[#666666]" /> : <FiChevronDown className="w-4 h-4 text-[#666666]" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2">
          {safeItems.map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm leading-relaxed">
              <span className="text-[#666666] mt-0.5 shrink-0">-</span>
              <span className="text-[#141414]">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResumePreview({ text }: { text: string }) {
  if (!text) return null
  return (
    <div className="bg-white border border-[#d9d9d9] max-w-[700px] mx-auto">
      <div className="p-8 md:p-12 min-h-[600px]">
        {renderMarkdown(text)}
      </div>
    </div>
  )
}

function AgentStatusPanel({ activeAgentId }: { activeAgentId: string | null }) {
  const agents = [
    { id: ANALYZER_AGENT_ID, name: 'Resume Analyzer', purpose: 'Scores resume against job description' },
    { id: OPTIMIZER_AGENT_ID, name: 'Resume Optimizer', purpose: 'Rewrites resume with targeted improvements' },
  ]

  return (
    <div className="border border-[#d9d9d9] bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiCpu className="w-4 h-4 text-[#666666]" />
        <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666]">Agent Status</h3>
      </div>
      <div className="space-y-2">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-2">
            <div
              className={cn(
                'w-2 h-2 shrink-0',
                activeAgentId === agent.id ? 'bg-[#cc1a1a] animate-pulse' : 'bg-[#d9d9d9]'
              )}
            />
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#141414] truncate">{agent.name}</div>
              <div className="text-xs text-[#666666] truncate">{agent.purpose}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Main Page ----

export default function Page() {
  // State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [assetIds, setAssetIds] = useState<string[]>([])
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [moduleOutputs, setModuleOutputs] = useState<ModuleOutputs | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derived
  const hasResumeInput = inputMode === 'file' ? assetIds.length > 0 : resumeText.trim().length > 0
  const hasJD = jobDescription.trim().length > 0
  const canAnalyze = hasResumeInput && hasJD && !isAnalyzing

  // Handlers
  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    const allowedExtensions = ['.pdf', '.docx', '.txt']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      setUploadError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.')
      return
    }

    setUploadError(null)
    setUploadedFile(file)
    setIsUploading(true)

    try {
      const result = await uploadFiles(file)
      if (result.success && result.asset_ids.length > 0) {
        setAssetIds(result.asset_ids)
      } else {
        setUploadError(result.error ?? 'Failed to upload file. Please try again.')
        setUploadedFile(null)
      }
    } catch {
      setUploadError('An error occurred during upload. Please try again.')
      setUploadedFile(null)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const removeFile = useCallback(() => {
    setUploadedFile(null)
    setAssetIds([])
    setUploadError(null)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (showSampleData) {
      setAnalysisResult(SAMPLE_ANALYSIS)
      setCurrentStep(2)
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setActiveAgentId(ANALYZER_AGENT_ID)

    try {
      let message = ''
      if (inputMode === 'text') {
        message = `Analyze the following resume against this job description.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}`
      } else {
        message = `Analyze the uploaded resume against this job description.\n\nJOB DESCRIPTION:\n${jobDescription}`
      }

      const options = assetIds.length > 0 ? { assets: assetIds } : undefined
      const result = await callAIAgent(message, ANALYZER_AGENT_ID, options)

      if (result.success) {
        const data = result?.response?.result
        if (data) {
          setAnalysisResult({
            overall_score: data?.overall_score ?? 0,
            summary: data?.summary ?? '',
            dimensions: {
              skills: data?.dimensions?.skills ?? { score: 0, status: 'Unknown', findings: [] },
              experience: data?.dimensions?.experience ?? { score: 0, status: 'Unknown', findings: [] },
              keywords: data?.dimensions?.keywords ?? { score: 0, status: 'Unknown', findings: [] },
              education: data?.dimensions?.education ?? { score: 0, status: 'Unknown', findings: [] },
              achievements: data?.dimensions?.achievements ?? { score: 0, status: 'Unknown', findings: [] },
            },
            gaps: Array.isArray(data?.gaps) ? data.gaps : [],
            strengths: Array.isArray(data?.strengths) ? data.strengths : [],
          })
          setCurrentStep(2)
        } else {
          setError('Unexpected response format from the analyzer. Please try again.')
        }
      } else {
        setError(result.error ?? 'Analysis failed. Please try again.')
      }
    } catch {
      setError('An error occurred during analysis. Please try again.')
    } finally {
      setIsAnalyzing(false)
      setActiveAgentId(null)
    }
  }, [showSampleData, inputMode, resumeText, jobDescription, assetIds])

  const handleOptimize = useCallback(async () => {
    if (showSampleData) {
      setOptimizationResult(SAMPLE_OPTIMIZATION)
      setModuleOutputs(null)
      setCurrentStep(3)
      return
    }

    setIsOptimizing(true)
    setError(null)
    setActiveAgentId(OPTIMIZER_AGENT_ID)

    try {
      let message = ''
      const analysisJSON = JSON.stringify(analysisResult)
      if (inputMode === 'text') {
        message = `Optimize the following resume based on the job description and analysis results.\n\nRESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jobDescription}\n\nANALYSIS RESULTS:\n${analysisJSON}`
      } else {
        message = `Optimize the uploaded resume based on the job description and analysis results.\n\nJOB DESCRIPTION:\n${jobDescription}\n\nANALYSIS RESULTS:\n${analysisJSON}`
      }

      const options = assetIds.length > 0 ? { assets: assetIds } : undefined
      const result = await callAIAgent(message, OPTIMIZER_AGENT_ID, options)

      if (result.success) {
        const data = result?.response?.result
        if (data) {
          setOptimizationResult({
            optimized_resume_text: data?.optimized_resume_text ?? '',
            changes_made: Array.isArray(data?.changes_made) ? data.changes_made : [],
            keyword_additions: Array.isArray(data?.keyword_additions) ? data.keyword_additions : [],
            formatting_notes: data?.formatting_notes ?? '',
          })
          const artFiles = result?.module_outputs
          if (artFiles) {
            setModuleOutputs(artFiles)
          }
          setCurrentStep(3)
        } else {
          setError('Unexpected response format from the optimizer. Please try again.')
        }
      } else {
        setError(result.error ?? 'Optimization failed. Please try again.')
      }
    } catch {
      setError('An error occurred during optimization. Please try again.')
    } finally {
      setIsOptimizing(false)
      setActiveAgentId(null)
    }
  }, [showSampleData, analysisResult, inputMode, resumeText, jobDescription, assetIds])

  const handleReset = useCallback(() => {
    setCurrentStep(1)
    setResumeText('')
    setJobDescription('')
    setUploadedFile(null)
    setAssetIds([])
    setAnalysisResult(null)
    setOptimizationResult(null)
    setModuleOutputs(null)
    setError(null)
    setUploadError(null)
    setShowSampleData(false)
  }, [])

  const handleDownload = useCallback(() => {
    const files = Array.isArray(moduleOutputs?.artifact_files) ? moduleOutputs.artifact_files : []
    if (files.length > 0 && files[0]?.file_url) {
      window.open(files[0].file_url, '_blank')
      return
    }
    // Fallback: download text as file
    const text = optimizationResult?.optimized_resume_text ?? ''
    if (!text) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized_resume.txt'
    a.click()
    URL.revokeObjectURL(url)
  }, [moduleOutputs, optimizationResult])

  // Sample data effect
  useEffect(() => {
    if (showSampleData && currentStep === 1) {
      setResumeText('Experienced Software Engineer with 4+ years of experience in React, TypeScript, and Node.js. Built customer-facing platforms and internal tools. BS in Computer Science from Stanford University. AWS Solutions Architect certified.')
      setJobDescription('We are looking for a Senior Software Engineer with 3+ years experience in React, TypeScript, Node.js. Must have experience with CI/CD, microservices, agile methodology, AWS, cross-functional team leadership. Experience with Terraform and Docker preferred.')
      setInputMode('text')
    }
  }, [showSampleData, currentStep])

  // ---- Render ----

  return (
    <ErrorBoundary>
      <div style={THEME_VARS} className="min-h-screen bg-[#fafafa] text-[#141414]">
        {/* Header */}
        <header className="border-b border-[#d9d9d9] bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-xl font-bold tracking-tight">ResumeForge</h1>
              <span className="text-xs text-[#666666] border-l border-[#d9d9d9] pl-3 hidden sm:inline">AI Resume Optimizer</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-[#666666]">Sample Data</span>
                <button
                  onClick={() => setShowSampleData(!showSampleData)}
                  className="text-[#141414]"
                  aria-label="Toggle sample data"
                >
                  {showSampleData ? <FiToggleRight className="w-6 h-6" /> : <FiToggleLeft className="w-6 h-6 text-[#999999]" />}
                </button>
              </label>
            </div>
          </div>
        </header>

        {/* Step Indicator */}
        <div className="border-b border-[#d9d9d9] bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-8">
          {/* Global Error */}
          {error && (
            <div className="mb-6 border border-[#cc1a1a] bg-white p-4 flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-[#cc1a1a] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[#141414]">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-[#666666] hover:text-[#141414]">
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: Upload */}
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">Upload Your Resume</h2>
                <p className="text-sm text-[#666666] leading-relaxed max-w-lg mx-auto">
                  Provide your resume and the target job description. We will analyze how well they match and suggest improvements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Resume Input */}
                <div className="border border-[#d9d9d9] bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-sm tracking-tight flex items-center gap-2">
                      <FiFileText className="w-4 h-4 text-[#666666]" />
                      Resume
                    </h3>
                    <button
                      onClick={() => {
                        setInputMode(inputMode === 'file' ? 'text' : 'file')
                        setUploadError(null)
                      }}
                      className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#141414] transition-colors"
                    >
                      {inputMode === 'file' ? <FiType className="w-3 h-3" /> : <FiUpload className="w-3 h-3" />}
                      {inputMode === 'file' ? 'Paste text instead' : 'Upload file instead'}
                    </button>
                  </div>

                  {inputMode === 'file' ? (
                    <div>
                      {!uploadedFile ? (
                        <div
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-[#d9d9d9] hover:border-[#141414] transition-colors cursor-pointer p-8 text-center"
                        >
                          <FiUpload className="w-8 h-8 text-[#999999] mx-auto mb-3" />
                          <p className="text-sm text-[#141414] font-medium mb-1">Drop your resume here</p>
                          <p className="text-xs text-[#666666]">or click to browse. PDF, DOCX, or TXT</p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.txt"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (f) handleFileSelect(f)
                            }}
                          />
                        </div>
                      ) : (
                        <div className="border border-[#d9d9d9] p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <FiFile className="w-5 h-5 text-[#666666] shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#141414] truncate">{uploadedFile.name}</p>
                              <p className="text-xs text-[#666666]">
                                {isUploading ? 'Uploading...' : assetIds.length > 0 ? 'Ready' : 'Processing'}
                              </p>
                            </div>
                          </div>
                          <button onClick={removeFile} className="text-[#666666] hover:text-[#cc1a1a] shrink-0">
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {isUploading && (
                        <div className="mt-3 flex items-center gap-2">
                          <FiRefreshCw className="w-3 h-3 text-[#666666] animate-spin" />
                          <span className="text-xs text-[#666666]">Uploading file...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume text here..."
                      className="w-full h-48 border border-[#cccccc] bg-white p-3 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#141414] transition-colors placeholder:text-[#999999]"
                    />
                  )}

                  {uploadError && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#cc1a1a]">
                      <FiAlertCircle className="w-3 h-3 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-[#666666]">
                    {inputMode === 'file' ? 'Your file is processed securely and never stored permanently.' : 'Paste the full text of your resume including all sections.'}
                  </p>
                </div>

                {/* Job Description Input */}
                <div className="border border-[#d9d9d9] bg-white p-6">
                  <h3 className="font-serif font-bold text-sm tracking-tight flex items-center gap-2 mb-4">
                    <FiClipboard className="w-4 h-4 text-[#666666]" />
                    Job Description
                  </h3>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full h-48 border border-[#cccccc] bg-white p-3 text-sm leading-relaxed resize-none focus:outline-none focus:border-[#141414] transition-colors placeholder:text-[#999999]"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-[#666666]">Include the full job posting for best results.</p>
                    <span className="text-xs text-[#666666]">{jobDescription.length} chars</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className={cn(
                    'inline-flex items-center gap-2 px-8 py-3 text-sm font-medium tracking-tight transition-colors',
                    canAnalyze
                      ? 'bg-[#141414] text-[#fafafa] hover:bg-[#333333]'
                      : 'bg-[#ebebeb] text-[#999999] cursor-not-allowed'
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing your resume...
                    </>
                  ) : (
                    <>
                      <FiTarget className="w-4 h-4" />
                      Analyze Match
                    </>
                  )}
                </button>
                {!hasResumeInput && !hasJD && !showSampleData && (
                  <p className="mt-3 text-xs text-[#666666]">Provide both a resume and job description to continue.</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Score */}
          {currentStep === 2 && analysisResult && (
            <div>
              {/* Overall Score */}
              <div className="border border-[#d9d9d9] bg-white p-6 mb-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ScoreRing score={analysisResult.overall_score} size={140} />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-serif text-xl font-bold tracking-tight mb-2">Match Score</h2>
                    <p className="text-sm text-[#666666] leading-relaxed">
                      {analysisResult.summary || 'Your resume has been analyzed against the target job description.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimension Cards */}
              <div className="mb-6">
                <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666] mb-3">Dimension Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DimensionCard
                    name="Skills"
                    data={analysisResult.dimensions.skills}
                    icon={<FiZap className="w-4 h-4" />}
                  />
                  <DimensionCard
                    name="Experience"
                    data={analysisResult.dimensions.experience}
                    icon={<FiBriefcase className="w-4 h-4" />}
                  />
                  <DimensionCard
                    name="Keywords"
                    data={analysisResult.dimensions.keywords}
                    icon={<FiKey className="w-4 h-4" />}
                  />
                  <DimensionCard
                    name="Education"
                    data={analysisResult.dimensions.education}
                    icon={<FiBookOpen className="w-4 h-4" />}
                  />
                  <DimensionCard
                    name="Achievements"
                    data={analysisResult.dimensions.achievements}
                    icon={<FiAward className="w-4 h-4" />}
                  />
                </div>
              </div>

              {/* Gaps and Strengths */}
              <div className="space-y-3 mb-8">
                <AccordionSection
                  title="Identified Gaps"
                  items={analysisResult.gaps}
                  icon={<FiAlertCircle className="w-4 h-4 text-[#cc1a1a]" />}
                />
                <AccordionSection
                  title="Key Strengths"
                  items={analysisResult.strengths}
                  icon={<FiStar className="w-4 h-4 text-[#141414]" />}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className={cn(
                    'inline-flex items-center gap-2 px-8 py-3 text-sm font-medium tracking-tight transition-colors',
                    isOptimizing
                      ? 'bg-[#ebebeb] text-[#999999] cursor-not-allowed'
                      : 'bg-[#141414] text-[#fafafa] hover:bg-[#333333]'
                  )}
                >
                  {isOptimizing ? (
                    <>
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                      Crafting your optimized resume...
                    </>
                  ) : (
                    <>
                      <FiEdit3 className="w-4 h-4" />
                      Optimize Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
                >
                  <FiChevronLeft className="w-4 h-4" />
                  Back to Upload
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Result */}
          {currentStep === 3 && optimizationResult && (
            <div>
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-bold tracking-tight mb-2">Optimized Resume</h2>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Your resume has been rewritten to better match the target position.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left: Changes */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Changes Made */}
                  <div className="border border-[#d9d9d9] bg-white p-4">
                    <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666] mb-3 flex items-center gap-2">
                      <FiEdit3 className="w-3 h-3" />
                      Changes Made
                    </h3>
                    <ul className="space-y-2">
                      {(Array.isArray(optimizationResult.changes_made) ? optimizationResult.changes_made : []).map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                          <FiCheckCircle className="w-3 h-3 text-[#141414] shrink-0 mt-0.5" />
                          <span className="text-[#141414]">{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keywords Added */}
                  <div className="border border-[#d9d9d9] bg-white p-4">
                    <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666] mb-3 flex items-center gap-2">
                      <FiKey className="w-3 h-3" />
                      Keywords Added
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(optimizationResult.keyword_additions) ? optimizationResult.keyword_additions : []).map((kw, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 text-xs bg-[#f0f0f0] text-[#141414] border border-[#d9d9d9]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formatting Notes */}
                  {optimizationResult.formatting_notes && (
                    <div className="border border-[#d9d9d9] bg-white p-4">
                      <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666] mb-3 flex items-center gap-2">
                        <FiFileText className="w-3 h-3" />
                        Formatting Notes
                      </h3>
                      <p className="text-xs text-[#141414] leading-relaxed">
                        {optimizationResult.formatting_notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Preview */}
                <div className="lg:col-span-2">
                  <div className="border border-[#d9d9d9] bg-[#f0f0f0] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif font-bold text-xs tracking-tight uppercase text-[#666666]">Preview</h3>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] text-[#fafafa] text-xs font-medium hover:bg-[#333333] transition-colors"
                      >
                        <FiDownload className="w-3 h-3" />
                        {Array.isArray(moduleOutputs?.artifact_files) && (moduleOutputs?.artifact_files?.length ?? 0) > 0 ? 'Download PDF' : 'Download TXT'}
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-[800px]">
                      <ResumePreview text={optimizationResult.optimized_resume_text} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#141414] text-[#fafafa] text-sm font-medium tracking-tight hover:bg-[#333333] transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  {Array.isArray(moduleOutputs?.artifact_files) && (moduleOutputs?.artifact_files?.length ?? 0) > 0 ? 'Download Optimized PDF' : 'Download as Text'}
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Try Another Job
                </button>
              </div>
            </div>
          )}

          {/* Loading overlays for Score screen optimization */}
          {currentStep === 2 && isOptimizing && (
            <div className="fixed inset-0 bg-[#fafafa]/80 z-50 flex items-center justify-center">
              <div className="border border-[#d9d9d9] bg-white p-8 text-center max-w-sm">
                <FiRefreshCw className="w-8 h-8 text-[#141414] mx-auto mb-4 animate-spin" />
                <h3 className="font-serif font-bold text-base tracking-tight mb-2">Optimizing Your Resume</h3>
                <p className="text-sm text-[#666666] leading-relaxed">
                  Crafting targeted improvements based on the analysis. This may take a moment.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Footer / Agent Status */}
        <footer className="border-t border-[#d9d9d9] bg-white mt-12">
          <div className="max-w-5xl mx-auto px-4 py-6">
            <AgentStatusPanel activeAgentId={activeAgentId} />
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}
