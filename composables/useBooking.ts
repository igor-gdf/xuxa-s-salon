export type Service = {
  id: string | number
  name: string
  duration: number
  price: number
  description?: string
}

type BookingState = {
  service: Service | null
  date: string | null
  time: string | null
  customer: {
    name: string
    phone: string
  }
}

export const useBooking = () => {
  const booking = useState<BookingState>('booking', () => ({
    service: null,
    date: null,
    time: null,
    customer: {
      name: '',
      phone: ''
    }
  }))

  const selectService = (service: Service) => {
    booking.value.service = {
      ...service,
      id: Number(service.id)
    }
  }

  const selectDate = (date: string) => {
    booking.value.date = date
  }

  const selectTime = (time: string) => {
    booking.value.time = time
  }

  const setCustomer = (name: string, phone: string) => {
    booking.value.customer = { name, phone }
  }

  const resetBooking = () => {
    booking.value = {
      service: null,
      date: null,
      time: null,
      customer: { name: '', phone: '' }
    }
  }

  const isReadyToConfirm = computed(() => {
    return !!(
      booking.value.service &&
      booking.value.date &&
      booking.value.time &&
      booking.value.customer.name &&
      booking.value.customer.phone
    )
  })

  return {
    booking,
    selectService,
    selectDate,
    selectTime,
    setCustomer,
    resetBooking,
    isReadyToConfirm
  }
}
