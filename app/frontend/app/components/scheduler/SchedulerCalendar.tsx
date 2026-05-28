import { Calendar, Tooltip } from 'antd';
import dayjs from 'dayjs';
import type { Scheduler } from '~/@types/scheduler';
import { SchedulerConstant } from '~/constants/SchedulerConstant';

type ComponentProps = {
  calendarEvents: Map<string, Scheduler[]>;
};

export function SchedulerCalendar({ calendarEvents }: ComponentProps) {
  /*
   * O Calendar do antd em modo fullscreen (padrão, sem fullscreen={false})
   * renderiza células com altura adequada e scroll nativo de eventos.
   * Envolto em um div com overflow controlado para caber no layout.
   */
  return (
    <div
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <Calendar
        cellRender={(current, info) => {
          // Renderiza apenas células de dia; deixa as células de mês intactas
          if (info.type !== 'date') return info.originNode;

          const key = current.format('YYYY-MM-DD');
          const events = calendarEvents.get(key) ?? [];
          if (!events.length) return null;

          return (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {events.slice(0, 3).map((event) => (
                <li key={event.id}>
                  <Tooltip
                    title={`${SchedulerConstant.status[event.status].label} · ${dayjs(event.scheduledAt).format('HH:mm')}`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: `${SchedulerConstant.status[event.status].color}18`,
                        borderLeft: `3px solid ${SchedulerConstant.status[event.status].color}`,
                        borderRadius: '0 4px 4px 0',
                        padding: '1px 5px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: '#555',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: '#999', marginRight: 3, flexShrink: 0 }}>
                          {dayjs(event.scheduledAt).format('HH:mm')}
                        </span>
                        {event.customer.name}
                      </span>
                    </div>
                  </Tooltip>
                </li>
              ))}
              {events.length > 3 && (
                <li>
                  <Tooltip
                    title={events
                      .slice(3)
                      .map((e) => e.customer.name)
                      .join(', ')}
                  >
                    <span style={{ fontSize: 11, color: '#999', paddingLeft: 4 }}>
                      +{events.length - 3} outros
                    </span>
                  </Tooltip>
                </li>
              )}
            </ul>
          );
        }}
      />
    </div>
  );
}
