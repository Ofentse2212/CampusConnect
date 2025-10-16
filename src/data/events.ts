
export type EventItem = {
  id: string
  title: string
  date: string // ISO date string
  time: string // e.g. 10:00 AM
  location: string
  imageUrl: string
  action: 'rsvp' | 'ticket'
  campus: 'mahikeng' | 'potchefstroom' | 'vaal'
  price?: number // only for ticketed events
}

export type MyEventItem = EventItem & { status: 'rsvp' | 'ticket' }

