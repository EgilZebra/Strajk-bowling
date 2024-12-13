import { http, HttpResponse } from 'msw';

export const handlers = [
    http.post(
        "https://h5jbtjv6if.execute-api.eu-north-1.amazonaws.com", 
        async ({ request }) => {
            const bookingInfo = await request.json();

            const testResponse = {
                when: bookingInfo.when,
                lanes: bookingInfo.lanes,
                people: bookingInfo.people,
                shoes: bookingInfo.shoes,
                price: (Number(bookingInfo.people) * 120) + (Number(bookingInfo.lanes) * 100),
                id: 'test123'
            }

            return HttpResponse.json(testResponse);
    })
]