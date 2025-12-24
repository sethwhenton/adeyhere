import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, ChevronDown, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QAItem } from '@/types';
import { toast } from 'sonner';

interface QASectionProps {
    spaceId: string;
    isHost: boolean;
    onBack: () => void;
}

// Mock data for demo - replace with Supabase hooks
const mockQAItems: QAItem[] = [
    {
        id: '1',
        spaceId: '1',
        question: 'What time does the event start?',
        answer: 'The event starts at 2:00 PM and runs until 8:00 PM.',
        createdAt: new Date(),
    },
    {
        id: '2',
        spaceId: '1',
        question: 'Is there parking available?',
        answer: 'Yes! Free parking is available in the lot behind the building.',
        createdAt: new Date(),
    },
    {
        id: '3',
        spaceId: '1',
        question: 'Can I bring my own food?',
        answer: 'Outside food is not permitted, but we have food vendors on site.',
        createdAt: new Date(),
    },
];

export function QASection({ spaceId, isHost, onBack }: QASectionProps) {
    const [items, setItems] = useState<QAItem[]>(mockQAItems);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState('');
    const [newAnswer, setNewAnswer] = useState('');

    const handleAddItem = () => {
        if (!newQuestion.trim() || !newAnswer.trim()) {
            toast.error('Please fill in both question and answer');
            return;
        }

        const newItem: QAItem = {
            id: Date.now().toString(),
            spaceId,
            question: newQuestion.trim(),
            answer: newAnswer.trim(),
            createdAt: new Date(),
        };

        setItems([newItem, ...items]);
        setNewQuestion('');
        setNewAnswer('');
        setIsAdding(false);
        toast.success('Q&A added!');
    };

    const handleDeleteItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
        toast.success('Q&A removed');
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">❓ Q&A</h2>
                    <p className="text-sm text-muted-foreground">Frequently asked questions</p>
                </div>
                {isHost && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        size="sm"
                        className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                    </Button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Add New Form */}
                <AnimatePresence>
                    {isAdding && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-sky-50 dark:bg-sky-900/20 rounded-2xl p-4 space-y-3"
                        >
                            <Input
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Question..."
                                className="h-12 rounded-xl"
                            />
                            <textarea
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                placeholder="Answer..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:outline-none resize-none"
                            />
                            <div className="flex gap-2">
                                <Button onClick={handleAddItem} className="flex-1 rounded-xl">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewQuestion('');
                                        setNewAnswer('');
                                    }}
                                    variant="secondary"
                                    className="rounded-xl"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Q&A Items */}
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-3xl mb-4">
                            ❓
                        </div>
                        <h3 className="font-semibold text-foreground mb-1">No Q&A yet</h3>
                        <p className="text-sm text-muted-foreground">
                            {isHost ? 'Add FAQs for your attendees' : 'Check back later for FAQs'}
                        </p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                            className="bg-secondary rounded-2xl overflow-hidden"
                        >
                            {/* Question Header */}
                            <button
                                onClick={() => toggleExpand(item.id)}
                                className="w-full flex items-center justify-between p-4 text-left"
                            >
                                <span className="font-medium text-foreground pr-4">{item.question}</span>
                                <motion.div
                                    animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                </motion.div>
                            </button>

                            {/* Answer (Expandable) */}
                            <AnimatePresence>
                                {expandedId === item.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className="border-t border-border"
                                    >
                                        <div className="p-4">
                                            <p className="text-muted-foreground">{item.answer}</p>

                                            {/* Host Actions */}
                                            {isHost && (
                                                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                                                    <Button
                                                        onClick={() => handleDeleteItem(item.id)}
                                                        variant="destructive"
                                                        size="sm"
                                                        className="rounded-xl"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>
        </>
    );
}
