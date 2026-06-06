import { Badge, Calendar, List, Tag, Typography } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import type { Scheduler } from '~/@types/scheduler';
import { SchedulerConstant } from '~/constants/SchedulerConstant';
import { useBreakpoint } from '~/hooks/useBreakpoint'; // veja nota abaixo

type ComponentProps = {
  calendarEvents: Map<string, Scheduler[]>;
};

export function SchedulerCalendar({ calendarEvents }: ComponentProps) {
  const isMobile = useBreakpoint('md'); // true quando < md
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const selectedKey = selectedDate.format('YYYY-MM-DD');
  const selectedEvents = calendarEvents.get(selectedKey) ?? [];

  /* ── Célula do calendário ── */
  const cellRender = (current: Dayjs, info: any) => {
    if (info.type !== 'date') return info.originNode;

    const key = current.format('YYYY-MM-DD');
    const events = calendarEvents.get(key) ?? [];
    if (!events.length) return null;

    if (isMobile) {
      // Em mobile mostramos apenas badges coloridos — sem texto
      return (
        <div
          style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {events.slice(0, 3).map((event) => (
            <Badge
              key={event.id}
              color={SchedulerConstant.status[event.status].color}
              style={{ width: 6, height: 6 }}
            />
          ))}
          {events.length > 3 && (
            <Badge count={`+${events.length - 3}`} size="small" color="#aaa" />
          )}
        </div>
      );
    }

    // Desktop: lista compacta com nome e horário
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
                }}
              >
                <span style={{ color: '#999', marginRight: 3 }}>
                  {dayjs(event.scheduledAt).format('HH:mm')}
                </span>
                {event.customer.name}
              </span>
            </div>
          </li>
        ))}
        {events.length > 3 && (
          <li>
            <span style={{ fontSize: 11, color: '#999', paddingLeft: 4 }}>
              +{events.length - 3} outros
            </span>
          </li>
        )}
      </ul>
    );
  };

  return (
    <div style={{ border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
      <Calendar
        fullscreen={!isMobile} // ← chave: compacto em mobile
        cellRender={cellRender}
        onSelect={(date) => setSelectedDate(date)}
      />

      {/* Painel de eventos do dia — visível apenas em mobile */}
      {isMobile && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 16px' }}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            {selectedDate.format('DD [de] MMMM')}
            {' · '}
            <Typography.Text type="secondary">
              {selectedEvents.length} pedido(s)
            </Typography.Text>
          </Typography.Text>

          {selectedEvents.length === 0 ? (
            <Typography.Text type="secondary">Nenhum pedido neste dia.</Typography.Text>
          ) : (
            <List
              size="small"
              dataSource={selectedEvents}
              renderItem={(event) => (
                <List.Item style={{ padding: '6px 0' }}>
                  <List.Item.Meta
                    avatar={
                      <Badge color={SchedulerConstant.status[event.status].color} />
                    }
                    title={
                      <Typography.Text style={{ fontSize: 13 }}>
                        {event.customer.name}
                      </Typography.Text>
                    }
                    description={
                      <span style={{ fontSize: 12 }}>
                        {dayjs(event.scheduledAt).format('HH:mm')}
                        {' · '}
                        <Tag
                          color={SchedulerConstant.status[event.status].color}
                          style={{ borderRadius: 20, fontSize: 11 }}
                        >
                          {SchedulerConstant.status[event.status].label}
                        </Tag>
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
