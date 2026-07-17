'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'ruby', 'go', 'php', 'other']

const SAMPLE_CODE: Record<string, string> = {
  javascript: `// Sample JavaScript code with some issues
var userName = "John";
var userAge = 25;

function getUserInfo(user) {
  if (user.name == null) {
    console.log("No name found");
    return null;
  }
  
  var result = [];
  for (var i = 0; i < user.items.length; i++) {
    result.push(user.items[i]);
  }
  
  // TODO: Add validation here
  document.getElementById("output").innerHTML = user.data;
  
  return result;
}

async function fetchUserData(id) {
  const response = await fetch('/api/users/' + id);
  const data = await response.json();
  return data;
}`,
  python: `# Sample Python code with some issues
import os
import sys

class UserManager:
    users = []  # Mutable class variable - bug!
    
    def __init__(self, name, items=[]):  # Mutable default argument!
        self.name = name
        self.items = items
    
    def get_user(self, user_id):
        for user in self.users:
            if user["id"] == user_id:
                return user
        return None
    
    def add_user(self, user):
        # TODO: Add validation
        self.users.append(user)
        print "User added"  # Python 2 syntax!
    
    def process(self):
        try:
            result = self.users[0]["name"]
            return result
        except:  # Bare except!
            pass`,
  java: `// Sample Java code with issues
import java.util.*;

public class UserService {
    private List<String> users = new ArrayList<>();
    
    public void addUser(String name, String password) {
        // Storing plain text password - security issue!
        System.out.println("Adding user: " + name);
        users.add(name + ":" + password);
    }
    
    public boolean authenticate(String name, String password) {
        for (String user : users) {
            String[] parts = user.split(":");
            // String comparison with == - bug!
            if (parts[0] == name && parts[1] == password) {
                return true;
            }
        }
        return false;
    }
    
    public String getUser(int index) {
        return users.get(index); // No bounds check!
    }
}`,
}

export default function NewReviewPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'paste' | 'upload'>('paste')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    setToken(localStorage.getItem('cr_token'))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setTitle(`Review: ${f.name}`)
    const ext = f.name.split('.').pop()?.toLowerCase()
    const langMap: Record<string, string> = { js: 'javascript', ts: 'typescript', py: 'python', java: 'java', cpp: 'cpp', cs: 'csharp', rb: 'ruby', go: 'go', php: 'php' }
    if (ext && langMap[ext]) setLanguage(langMap[ext])
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      let res
      if (tab === 'upload' && file) {
        const formData = new FormData()
        formData.append('file', file)
        res = await axios.post(`${API}/reviews/upload`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        })
      } else {
        if (!code.trim()) { setError('Please enter some code'); setLoading(false); return }
        res = await axios.post(`${API}/reviews`, { code, language, title: title || `${language} Review` }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      router.push(`/review/${res.data.review.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally { setLoading(false) }
  }

  const loadSample = () => {
    setCode(SAMPLE_CODE[language] || SAMPLE_CODE.javascript)
    setTitle(`Sample ${language} Review`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a1d27', borderBottom: '1px solid #2d3148', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16 }}>CodeReview AI</span>
        </div>
        <Link href="/dashboard"><button className="btn-ghost">← Back to Dashboard</button></Link>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>New Code Review</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Submit your code for AI-powered analysis and static review</p>

        {error && <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '10px 14px', borderRadius: 6, marginBottom: 20, fontSize: 13 }}>{error}</div>}

        {/* Title + Language */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Review Title (optional)</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Code Review" />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, marginBottom: 6 }}>Language *</label>
            <select className="input" value={language} onChange={e => setLanguage(e.target.value)}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#1a1d27', borderRadius: 8, padding: 4, width: 'fit-content', border: '1px solid #2d3148' }}>
          {(['paste', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                background: tab === t ? '#3b82f6' : 'transparent', color: tab === t ? 'white' : '#94a3b8' }}>
              {t === 'paste' ? '📝 Paste Code' : '📁 Upload File'}
            </button>
          ))}
        </div>

        {tab === 'paste' ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #2d3148' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>{code.split('\n').length} lines · {code.length} chars</span>
              <button onClick={loadSample} className="btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Load Sample Code</button>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={`Paste your ${language} code here...`}
              style={{
                width: '100%', minHeight: 400, background: '#0d1117', border: 'none',
                color: '#e2e8f0', padding: '16px', fontFamily: 'Consolas, Monaco, monospace',
                fontSize: 13, lineHeight: 1.6, resize: 'vertical', outline: 'none'
              }}
            />
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <input ref={fileRef} type="file" accept=".js,.ts,.py,.java,.cpp,.cs,.rb,.go,.php,.c,.jsx,.tsx" onChange={handleFileChange} style={{ display: 'none' }} />
            {file ? (
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>{file.name}</div>
                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>{(file.size / 1024).toFixed(1)} KB · {language}</div>
                <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="btn-ghost">Remove file</button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>Drop your code file here</div>
                <div style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>Supports .js .ts .py .java .cpp .cs .rb .go .php</div>
                <button onClick={() => fileRef.current?.click()} className="btn-primary">Choose File</button>
              </div>
            )}
          </div>
        )}

        {/* AI info box */}
        <div style={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8, padding: '14px 18px', marginTop: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Two-Stage Analysis</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>
              Stage 1: Static analysis (syntax errors, style issues, security) · Stage 2: AI review (bugs, performance, best practices)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={handleSubmit} disabled={loading || (tab === 'paste' && !code.trim()) || (tab === 'upload' && !file)}
            className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                Analyzing Code...
              </span>
            ) : '🚀 Start Review'}
          </button>
          <Link href="/dashboard"><button className="btn-ghost" style={{ padding: '12px 24px' }}>Cancel</button></Link>
        </div>

        {loading && (
          <div style={{ marginTop: 20, padding: '16px 20px', background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8 }}>
            <div style={{ color: '#3b82f6', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🔍 Analyzing your code...</div>
            <div style={{ color: '#64748b', fontSize: 13 }}>Running static analysis and AI review. This may take 10-30 seconds.</div>
          </div>
        )}
      </div>
    </div>
  )
}