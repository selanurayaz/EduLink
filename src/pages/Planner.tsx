import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Play, Battery, BatteryCharging,
    AlertCircle, Clock, CheckCircle2, BrainCircuit, Trash2, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Task {
    id: number;
    title: string;
    duration: number;
    is_urgent: boolean;
    is_important: boolean;
    energy: 'high' | 'low';
    completed: boolean;
}

const Planner: React.FC = () => {
    const navigate = useNavigate();

    // FORM STATE
    const [newTask, setNewTask] = useState('');
    const [duration, setDuration] = useState('40');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isImportant, setIsImportant] = useState(false);
    const [energy, setEnergy] = useState<'high' | 'low'>('high');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Hata:', error);
        else setTasks(data || []);
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { error } = await supabase.from('tasks').insert({
                user_id: user.id,
                title: newTask,
                duration: parseInt(duration),
                is_urgent: isUrgent,
                is_important: isImportant,
                energy: energy
            });

            if (error) {
                alert("Görev eklenirken hata oldu!");
                console.error(error);
            } else {
                setNewTask('');
                fetchTasks();
            }
        }
        setLoading(false);
    };

    const toggleComplete = async (id: number, currentStatus: boolean) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
        await supabase.from('tasks').update({ completed: !currentStatus }).eq('id', id);
    };

    const deleteTask = async (id: number) => {
        if(!confirm("Bu görevi silmek istiyor musun?")) return;
        setTasks(tasks.filter(t => t.id !== id));
        await supabase.from('tasks').delete().eq('id', id);
    };

    // RENK VE ETİKET MANTIĞI
    const getPriorityColor = (urgent: boolean, important: boolean) => {
        if (urgent && important) return "bg-red-100 text-red-600 border-red-200";
        if (!urgent && important) return "bg-blue-100 text-blue-600 border-blue-200";
        if (urgent && !important) return "bg-orange-100 text-orange-600 border-orange-200";
        return "bg-slate-100 text-slate-500 border-slate-200";
    };

    const getPriorityLabel = (urgent: boolean, important: boolean) => {
        if (urgent && important) return "🚨 HEMEN YAP";
        if (!urgent && important) return "📅 PLANLA";
        if (urgent && !important) return "⚡ DEVRET";
        return "🗑️ ERTELE";
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-200 p-4 md:p-8">

            {/* ARKA PLAN EFEKTLERİ */}
            <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob z-0"></div>
            <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-400/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000 z-0"></div>

            <div className="max-w-5xl mx-auto relative z-10">

                {/* ÜST BAR */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white hover:bg-slate-100 text-slate-600 rounded-xl shadow-sm border border-slate-200 transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Akıllı Planlayıcı 🚀</h1>
                        <p className="text-slate-500 font-medium">Günün görevlerini organize et.</p>
                    </div>
                </div>

                {/* AI COACH BOX */}
                <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl shadow-purple-900/5 rounded-3xl p-6 mb-8 flex gap-5 items-start relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

                    <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shrink-0 relative z-10">
                        <BrainCircuit size={32} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-purple-700 text-sm mb-1 uppercase tracking-wider flex items-center gap-2">
                            AI Asistanın Diyor ki
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                        </h3>
                        <p className="text-slate-700 font-medium leading-relaxed">
                            "Harika gidiyorsun! Veritabanındaki görevlerin güvende. Bugün listeye <span className="font-bold text-purple-600">Zorluk Derecesi Yüksek</span> bir ders ekleyip sabah saatlerinde bitirmeye ne dersin? 🧠"
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* SOL: GÖREV EKLEME FORMU */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-blue-900/5 rounded-[2rem] p-6 sticky top-6">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-slate-800">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Plus size={20}/>
                                </div>
                                Yeni Görev
                            </h2>

                            <form onSubmit={handleAddTask} className="space-y-5">
                                {/* Görev Adı */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Görev Başlığı</label>
                                    <input
                                        type="text"
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 px-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
                                        placeholder="Örn: Fizik Çalış"
                                    />
                                </div>

                                {/* Süre */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Süre (Dk)</label>
                                    <div className="relative">
                                        <Clock size={18} className="absolute left-3.5 top-3.5 text-slate-400"/>
                                        <input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Eisenhower Butonları */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsUrgent(!isUrgent)}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all font-bold text-xs ${isUrgent ? 'bg-red-50 border-red-200 text-red-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <AlertCircle size={20} /> ACİL Mİ?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsImportant(!isImportant)}
                                        className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all font-bold text-xs ${isImportant ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                                    >
                                        <AlertCircle size={20} /> ÖNEMLİ Mİ?
                                    </button>
                                </div>

                                {/* Enerji */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setEnergy('high')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${energy === 'high' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        <BatteryCharging size={18} /> Yüksek
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEnergy('low')}
                                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${energy === 'low' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        <Battery size={18} /> Düşük
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Ekleniyor...' : 'Listeye Ekle'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* SAĞ: GÖREV LİSTESİ */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Yapılacaklar ({tasks.length})</h2>
                            {tasks.length > 0 && (
                                <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {tasks.filter(t => t.completed).length} Tamamlandı
                        </span>
                            )}
                        </div>

                        {tasks.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Plus size={32} />
                                </div>
                                <p className="font-medium">Listen boş. Soldan ilk görevini ekle! ✨</p>
                            </div>
                        )}

                        {tasks.map((task) => (
                            <div key={task.id} className={`group bg-white border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-200 rounded-2xl p-5 flex items-center justify-between transition-all duration-300 ${task.completed ? 'opacity-60 bg-slate-50' : ''}`}>

                                <div className="flex items-center gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleComplete(task.id, task.completed)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-400'}`}
                                    >
                                        <CheckCircle2 size={18} fill="currentColor" className={task.completed ? 'opacity-100' : 'opacity-0'} />
                                    </button>

                                    <div>
                                        <h3 className={`font-bold text-lg transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</h3>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getPriorityColor(task.is_urgent, task.is_important)}`}>
                                        {getPriorityLabel(task.is_urgent, task.is_important)}
                                    </span>

                                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                        <Clock size={12} /> {task.duration} dk
                                    </span>

                                            <span className={`text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-md border ${task.energy === 'high' ? 'text-green-600 bg-green-50 border-green-100' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>
                                        {task.energy === 'high' ? <Zap size={12}/> : <Battery size={12}/>}
                                                {task.energy === 'high' ? 'Yüksek Enerji' : 'Düşük Enerji'}
                                    </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pl-4 border-l border-slate-100 ml-4 md:ml-0">
                                    {/* Silme Butonu */}
                                    <button
                                        onClick={() => deleteTask(task.id)}
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        title="Sil"
                                    >
                                        <Trash2 size={20} />
                                    </button>

                                    {/* Başlat Butonu */}
                                    {!task.completed && (
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-600/20 flex items-center gap-2 hover:scale-105 transition-all"
                                            title="Odaklanmayı Başlat"
                                        >
                                            <Play fill="currentColor" size={20} />
                                        </button>
                                    )}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Planner;