import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';

const WIDTH = 320;
const HEIGHT = 200;
const PADDING = { left: 44, right: 12, top: 16, bottom: 30 };

function formatTick(value) {
  return Math.abs(value) >= 100 ? String(Math.round(value)) : String(Math.round(value * 10) / 10);
}

/**
 * Line chart of one indicator over time, with its reference range drawn as a
 * shaded band. Points are evenly spaced (readings are sparse and irregular).
 * `points`: [{ valueNumeric, refMin, refMax, flag, label }] oldest first.
 */
export function ValueChart({ points }) {
  const theme = useTheme();

  const layout = useMemo(() => {
    const values = points.map(point => point.valueNumeric);
    const refs = points.flatMap(point => [point.refMin, point.refMax]).filter(value => value !== null);
    const all = [...values, ...refs];
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (min === max) {
      min -= 1;
      max += 1;
    }
    const pad = (max - min) * 0.1;
    min -= pad;
    max += pad;
    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
    const x = index => PADDING.left + (points.length === 1 ? plotWidth / 2 : (index / (points.length - 1)) * plotWidth);
    const y = value => PADDING.top + (1 - (value - min) / (max - min)) * plotHeight;
    const last = points[points.length - 1];
    return {
      min,
      max,
      x,
      y,
      plotHeight,
      band: last.refMin !== null || last.refMax !== null ? { top: y(last.refMax ?? max), bottom: y(last.refMin ?? min) } : null,
      ticks: [0, 1, 2, 3].map(step => min + ((max - min) * step) / 3)
    };
  }, [points]);

  const linePoints = points.map((point, index) => `${layout.x(index)},${layout.y(point.valueNumeric)}`).join(' ');

  return <View style={{ alignItems: 'center' }}>
      <Svg width={WIDTH} height={HEIGHT}>
        {layout.band && <Rect x={PADDING.left} y={layout.band.top} width={WIDTH - PADDING.left - PADDING.right} height={Math.max(0, layout.band.bottom - layout.band.top)} fill={theme.success} opacity={0.14} />}
        {layout.ticks.map(tick => <SvgText key={tick} x={PADDING.left - 8} y={layout.y(tick) + 3} fontSize={9} fill={theme.textSecondary} textAnchor="end">
            {formatTick(tick)}
          </SvgText>)}
        {layout.ticks.map(tick => <Line key={`grid-${tick}`} x1={PADDING.left} x2={WIDTH - PADDING.right} y1={layout.y(tick)} y2={layout.y(tick)} stroke={theme.border} strokeWidth={1} />)}
        {points.length > 1 && <Polyline points={linePoints} fill="none" stroke={theme.primary} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />}
        {points.map((point, index) => <Circle key={index} cx={layout.x(index)} cy={layout.y(point.valueNumeric)} r={5} fill={point.flag ? theme.error : theme.primary} />)}
        {points.map((point, index) => <SvgText key={`label-${index}`} x={layout.x(index)} y={HEIGHT - 8} fontSize={9} fill={theme.textSecondary} textAnchor="middle">
            {point.label}
          </SvgText>)}
      </Svg>
    </View>;
}
