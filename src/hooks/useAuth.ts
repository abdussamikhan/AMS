import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { Profile } from '../types'

export const useAuth = () => {
    const [session, setSession] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(false)
    const [isAppLoading, setIsAppLoading] = useState(true)
    const [authEmail, setAuthEmail] = useState('')
    const [authPassword, setAuthPassword] = useState('')
    const [authFullName, setAuthFullName] = useState('')
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
    const [selectedRole, setSelectedRole] = useState<'auditor' | 'manager' | 'client'>('manager')

    const fetchProfile = async (uid: string) => {
        const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
        if (data) setProfile(data)
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            if (session) fetchProfile(session.user.id)
            setIsAppLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            if (session) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setIsAppLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsAuthLoading(true)
        try {
            if (authMode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email: authEmail,
                    password: authPassword
                })
                if (error) throw error
            } else {
                const { error } = await supabase.auth.signUp({
                    email: authEmail,
                    password: authPassword,
                    options: {
                        data: {
                            role: selectedRole,
                            full_name: authFullName
                        }
                    }
                })
                if (error) throw error
                alert('Confirmation email sent! Please check your inbox (and spam).')
            }
        } catch (err: any) {
            alert(err.message)
        } finally {
            setIsAuthLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setProfile(null)
    }

    return {
        session,
        profile,
        isAuthLoading,
        isAppLoading,
        authEmail,
        setAuthEmail,
        authPassword,
        setAuthPassword,
        authFullName,
        setAuthFullName,
        authMode,
        setAuthMode,
        selectedRole,
        setSelectedRole,
        handleAuth,
        handleLogout
    }
}
