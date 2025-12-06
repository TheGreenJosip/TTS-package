import React, { useState, useEffect } from 'react';
import { Play, Download, Pause, Square, Activity, Volume2, Globe } from 'lucide-react';
import axios from 'axios';

const API_Base = 'http://localhost:4040';


// Removed hardcoded voices


export default function Dashboard() {
    const [text, setText] = useState('');
    const [availableVoices, setAvailableVoices] = useState([]);
    const [filteredVoices, setFilteredVoices] = useState([]);
    const [stats, setStats] = useState({ locales: [] });
    const [selectedLocale, setSelectedLocale] = useState('');
    const [voice, setVoice] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [
        isPaused, setIsPaused
    ] = useState(false);
    const [status, setStatus] = useState('online');

    useEffect(() => {
        // Fetch voices from backend
        axios.get(`${API_Base}/voices`)
            .then(res => {
                setAvailableVoices(res.data);

                // Extract locales
                const uniqueLocales = [...new Set(res.data.map(v => v.locale))].sort();
                setStats({ locales: uniqueLocales });

                // Default selection
                const defaultLocale = uniqueLocales.includes('en-US') ? 'en-US' : uniqueLocales[0];
                setSelectedLocale(defaultLocale);
            })
            .catch(err => console.error('Failed to load voices', err));
    }, []);

    // Filter voices when selections change
    useEffect(() => {
        if (!selectedLocale) return;
        const currentVoices = availableVoices.filter(v => v.locale === selectedLocale);
        setFilteredVoices(currentVoices);
        if (currentVoices.length > 0) {
            setVoice(currentVoices[0].name);
        } else {
            setVoice('');
        }
    }, [selectedLocale, availableVoices]);

    // ... handlers ...

    const handleSpeak = async () => {
        if (!text) return;
        setIsProcessing(true);
        try {
            await axios.post(`${API_Base}/tts`, { text, voice });
        } catch (err) {
            console.error(err);
            alert('Failed to send TTS request');
        } finally {
            setIsProcessing(false);
        }
    };

    // ... togglePause ...

    const togglePause = async () => {
        try {
            if (isPaused) {
                await axios.post(`${API_Base}/resume`);
                setIsPaused(false);
            } else {
                await axios.post(`${API_Base}/pause`);
                setIsPaused(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px' }}>
                        <Activity size={24} color="#fff" />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Azure TTS Command</h1>
                </div>
                <div className={`status-badge ${status}`}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }} />
                    {status === 'online' ? 'System Online' : 'System Offline'}
                </div>
            </header>

            <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Controls Section */}
                <section className="glass-panel" style={{ padding: '2rem' }}>

                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Globe size={14} style={{ display: 'inline', marginRight: 6 }} />
                                Region / Locale
                            </label>
                            <select
                                className="input-base"
                                value={selectedLocale}
                                onChange={(e) => setSelectedLocale(e.target.value)}
                            >
                                {stats.locales.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <Volume2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                                Select Voice
                            </label>
                            <select
                                className="input-base"
                                value={voice}
                                onChange={(e) => setVoice(e.target.value)}
                            >
                                {filteredVoices.map(v => (
                                    <option key={v.name} value={v.name}>{v.displayName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <Volume2 size={14} style={{ display: 'inline', marginRight: 6 }} />
                        Text Input
                    </label>
                    <textarea
                        className="input-base"
                        rows={6}
                        placeholder="Type something amazing..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ resize: 'vertical', fontFamily: 'inherit', marginBottom: '1.5rem' }}
                    />

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={handleSpeak} disabled={isProcessing}>
                            <Play size={18} fill="currentColor" />
                            Speak Now
                        </button>

                        {/* Download button removed */}

                        <div style={{ flex: 1 }}></div>

                        <button className="btn btn-secondary" onClick={togglePause} style={{ minWidth: 120 }}>
                            {isPaused ? <Play size={18} /> : <Pause size={18} />}
                            {isPaused ? 'Resume Queue' : 'Pause Queue'}
                        </button>
                    </div>

                </section>

                {/* History / Info Placeholder */}
                <section className="glass-panel" style={{ padding: '1.5rem', opacity: 0.7 }}>
                    <h3 style={{ marginTop: 0, fontSize: '1.1rem' }}>Usage Tips</h3>
                    <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.6' }}>
                        <li>You can also copy text prefixed with <strong>"TTS"</strong> to your clipboard to speak automatically.</li>
                        <li>Supported Markdown: Code blocks will be skipped, inline code is preserved.</li>
                        <li>Queue is managed globally on the backend.</li>
                    </ul>
                </section>

            </main>
        </div>
    );
}
