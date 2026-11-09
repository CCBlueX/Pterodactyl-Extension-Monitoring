<?php

declare(strict_types=1);

namespace Monitoring\Support;

/**
 * Parses the few /proc files the health page reads.
 */
final class Proc
{
    /**
     * @return array{total: int, available: int}|null Bytes.
     */
    public static function memory(string $meminfo): ?array
    {
        if (! preg_match('/^MemTotal:\s+(\d+)\s*kB/mi', $meminfo, $total) || ! preg_match('/^MemAvailable:\s+(\d+)\s*kB/mi', $meminfo, $available)) {
            return null;
        }

        return ['total' => (int) $total[1] * 1024, 'available' => (int) $available[1] * 1024];
    }

    /**
     * Container memory in use the way `docker stats` counts it: page cache the kernel can drop (inactive_file) is left out.
     */
    public static function containerUsed(string $current, string $stat): int
    {
        $inactive = preg_match('/^inactive_file\s+(\d+)$/m', $stat, $match) ? (int) $match[1] : 0;

        return max(0, (int) $current - $inactive);
    }

    /**
     * Interface and IPv4 gateway of each default route in /proc/net/route.
     *
     * @return list<array{interface: string, gateway: string}>
     */
    public static function gateways(string $route): array
    {
        $gateways = [];

        foreach (array_slice(preg_split('/\R/', mb_trim($route)) ?: [], 1) as $line) {
            $columns = preg_split('/\s+/', mb_trim($line)) ?: [];

            if (count($columns) < 4 || $columns[1] !== '00000000' || (hexdec($columns[3]) & 0x2) === 0 || ! preg_match('/^[0-9A-F]{8}$/i', $columns[2])) {
                continue;
            }

            $gateways[] = ['interface' => $columns[0], 'gateway' => implode('.', array_reverse(array_map(hexdec(...), mb_str_split($columns[2], 2))))];
        }

        return $gateways;
    }
}
