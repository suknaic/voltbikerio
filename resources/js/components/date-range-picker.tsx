import { Calendar } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type DateRangeValue = {
    from: string;
    to: string;
};

type DateRangePickerProps = {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
};

function formatDisplay(date: string): string {
    if (!date) {
        return '';
    }

    try {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch (error) {
        return date;
    }
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRangeValue>(value);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setDraft(value);
    }, [value]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const label = draft.from && draft.to
        ? `${formatDisplay(draft.from)} → ${formatDisplay(draft.to)}`
        : 'Selecionar período';

    function applyRange() {
        onChange({ from: draft.from, to: draft.to });
        setOpen(false);
    }

    function clearRange() {
        setDraft({ from: '', to: '' });
        onChange({ from: '', to: '' });
        setOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-muted-foreground transition hover:border-zinc-500"
            >
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="truncate text-zinc-200">{label}</span>
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-64 rounded-2xl border border-zinc-800 bg-black p-4 shadow-2xl">
                    <div className="space-y-3">
                        <div className="grid gap-1 text-sm">
                            <span className="text-xs text-zinc-400">Início</span>
                            <Input
                                type="date"
                                value={draft.from}
                                onChange={(event) =>
                                    setDraft((prev) => ({ ...prev, from: event.target.value }))
                                }
                            />
                        </div>
                        <div className="grid gap-1 text-sm">
                            <span className="text-xs text-zinc-400">Fim</span>
                            <Input
                                type="date"
                                value={draft.to}
                                min={draft.from || undefined}
                                onChange={(event) =>
                                    setDraft((prev) => ({ ...prev, to: event.target.value }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                            <Button variant="ghost" size="sm" type="button" onClick={clearRange}>
                                Limpar
                            </Button>
                            <Button size="sm" type="button" onClick={applyRange}>
                                Aplicar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
