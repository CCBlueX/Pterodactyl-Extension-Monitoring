import { Activity, BellRing, Network, Server, type LucideIcon } from 'lucide-react';
import { PanelLink, Stat, type StatProps } from '@pterodactyl/sdk';
import type { Headline } from '../api';

/** Four headline numbers, shared by the admin page and the overview widget. */
export default function StatTiles({ summary, linked = false }: { summary: Headline; linked?: boolean }) {
    const healthy = summary.scheduler.ok && summary.queue.ok;
    const tiles: { label: string; value: string; icon: LucideIcon; tone: StatProps['tone'] }[] = [
        { label: 'Servers running', value: `${summary.servers.running} / ${summary.servers.total}`, icon: Server, tone: 'neutral' },
        { label: 'Nodes reachable', value: `${summary.nodes.reachable} / ${summary.nodes.total}`, icon: Network, tone: summary.nodes.reachable < summary.nodes.total ? 'danger' : 'neutral' },
        { label: 'Open alerts', value: String(summary.alerts), icon: BellRing, tone: summary.alerts > 0 ? 'danger' : 'neutral' },
        { label: 'Background jobs', value: healthy ? 'Running' : 'Stalled', icon: Activity, tone: healthy ? 'success' : 'danger' },
    ];

    return (
        <div className='mon:mb-6 mon:grid mon:grid-cols-2 mon:gap-3 mon:lg:grid-cols-4'>
            {tiles.map((tile) => {
                const stat = <Stat label={tile.label} value={tile.value} icon={tile.icon} tone={tile.tone} title={`${tile.label}: ${tile.value}`} className='mon:h-full mon:min-w-0' />;

                return linked ? (
                    <PanelLink key={tile.label} destination={{ extension: 'monitoring', screen: 'admin' }} className='mon:block mon:min-w-0 mon:rounded-sm mon:no-underline mon:hover:opacity-90'>
                        {stat}
                    </PanelLink>
                ) : (
                    <div key={tile.label} className='mon:min-w-0'>
                        {stat}
                    </div>
                );
            })}
        </div>
    );
}
