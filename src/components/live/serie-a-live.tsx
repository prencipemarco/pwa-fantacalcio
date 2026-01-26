import { MOCK_LIVE_MATCHES } from '@/lib/live-mock-data';
import { Card, CardContent } from '@/components/ui/card';

export function SerieALive() {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 px-2">Serie A - Risultati</h2>

            {MOCK_LIVE_MATCHES.map((match) => (
                <Card key={match.id} className="bg-stone-900 border-stone-800 text-stone-200">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-mono text-stone-500">
                                {match.status === 'LIVE' ? (
                                    <span className="text-red-500 animate-pulse">● {match.minute}'</span>
                                ) : (
                                    match.status
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold">
                            <div className="flex-1 text-right pr-4">{match.homeTeam}</div>
                            <div className="bg-stone-800 px-3 py-1 rounded text-white font-mono border border-stone-700">
                                {match.status === 'SCHEDULED' ? '-' : match.homeScore} : {match.status === 'SCHEDULED' ? '-' : match.awayScore}
                            </div>
                            <div className="flex-1 text-left pl-4">{match.awayTeam}</div>
                        </div>

                        {/* Events Summary */}
                        {match.events.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-stone-800 text-xs text-stone-400 space-y-1">
                                {match.events.map((ev, i) => (
                                    <div key={i} className="flex items-center gap-1 justify-center">
                                        <span className="font-mono">{ev.minute}'</span>
                                        {ev.type === 'GOAL' && '⚽️'}
                                        {ev.type === 'ASSIST' && '🅰️'}
                                        {ev.type === 'YELLOW_CARD' && '🟨'}
                                        {ev.type === 'RED_CARD' && '🟥'}
                                        <span>{ev.playerName}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
