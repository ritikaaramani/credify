'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Credential {
  student_id: string;
  skills_acquired: string | string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  skills: string[];
}

interface StudentResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  credentials: Credential[];
}

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Add dark mode class to body
  useEffect(() => {
    document.body.className = 'bg-gray-900';
    return () => {
      document.body.className = '';
    };
  }, []);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Get students with their credentials
      // First get all students
      const { data: students, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          phone,
          created_at
        `)
        .eq('role', 'student');

      if (error) throw error;

      // Then get their credentials
      const { data: credentials, error: credError } = await supabase
        .from('credentials')
        .select('student_id, skills_acquired')
        .in('student_id', students.map(s => s.id));

      if (credError) throw credError;

      // Create a map of student_id to their skills
      const studentSkillsMap = new Map<string, string[]>();
      credentials?.forEach((cred: Credential) => {
        if (cred.skills_acquired && cred.student_id) {
          // Convert string to array (split by comma if it contains commas)
          let skills: string[] = [];
          if (typeof cred.skills_acquired === 'string') {
            skills = cred.skills_acquired.includes(',') 
              ? cred.skills_acquired.split(',').map(s => s.trim())
              : [cred.skills_acquired.trim()];
          } else if (Array.isArray(cred.skills_acquired)) {
            skills = cred.skills_acquired;
          }

          if (!studentSkillsMap.has(cred.student_id)) {
            studentSkillsMap.set(cred.student_id, []);
          }
          studentSkillsMap.get(cred.student_id)?.push(...skills);
        }
      });

      // Extract unique skills from all credentials
      const allSkills = new Set<string>();
      credentials?.forEach((cred: Credential) => {
        if (cred.skills_acquired) {
          let skills: string[] = [];
          if (typeof cred.skills_acquired === 'string') {
            skills = cred.skills_acquired.includes(',')
              ? cred.skills_acquired.split(',').map(s => s.trim())
              : [cred.skills_acquired.trim()];
          } else if (Array.isArray(cred.skills_acquired)) {
            skills = cred.skills_acquired;
          }
          skills.forEach(skill => allSkills.add(skill));
        }
      });
      setAvailableSkills(Array.from(allSkills).sort());

      const formattedStudents = students.map((student: any) => {
        // Get skills for this student from the map
        const skills = Array.from(new Set(studentSkillsMap.get(student.id) || []))
          .filter((skill: any) => skill); // Remove any null/undefined values
        
        return {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          created_at: student.created_at,
          skills: skills
        };
      });

      setStudents(formattedStudents);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower);

    const matchesSkills = 
      selectedSkills.length === 0 || 
      selectedSkills.every(skill => student.skills.includes(skill));

    return matchesSearch && matchesSkills;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-6">Student Dashboard</h1>
          <div className="space-y-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by skills {selectedSkills.length > 0 && `(${selectedSkills.length} selected)`}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => {
                      setSelectedSkills(prev =>
                        prev.includes(skill)
                          ? prev.filter(s => s !== skill)
                          : [...prev, skill]
                      );
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                      ${selectedSkills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/50 border border-red-700 p-4 mb-4">
            <div className="text-sm text-red-200">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Link
              href={`/student/${student.id}`}
              key={student.id}
              className="block"
            >
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-700 transition-all duration-200 hover:scale-[1.02]">
                <h2 className="text-xl font-semibold text-white">{student.name}</h2>
                <p className="mt-2 text-blue-400">{student.email}</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-300">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {student.phone || 'No phone number'}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Joined {new Date(student.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {student.skills?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-400 mb-2">Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {(student.skills || []).map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-700 
                            ${selectedSkills.includes(skill) ? 'text-blue-400 ring-1 ring-blue-400' : 'text-gray-300'}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-200">No results found</h3>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}