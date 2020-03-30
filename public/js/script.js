document.addEventListener('DOMContentLoaded', function () {
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    // // The Firebase SDK is initialized and available here!
    //
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.database().ref('/path/to/ref').on('value', snapshot => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });
    //
    // // 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
    const app = new Vue({
        el: '#app',
        data: {
            faq: [{ question: 'Q1', answer: 'Wee woo. Wee woo!'}],
            events: [],
            calendar: null
        },
        mounted () {
            this.calendar = new FullCalendar.Calendar(this.$refs.calendar, {
                plugins: ['dayGrid', 'timeGrid'],
                defaultView: 'timeGrid',
                events: [
                    {
                        title: 'Test Event',
                        start: dayjs('2020-04-24T13:00:00.000Z').toDate(),
                        end: dayjs('2020-04-24T16:00:00.000Z').toDate()
                    },
                    {
                        title: 'Test Event',
                        start: dayjs('2020-04-25T16:00:00.000Z').toDate(),
                        end: dayjs('2020-04-25T20:00:00.000Z').toDate()
                    }
                ],
                header: {
                    left: '',
                    center: '',
                    right: ''
                },
                // columnHeaderFormat: {
                //     weekday: 'long'
                // },
                visibleRange: {
                    start: '2020-04-24',
                    end: '2020-04-27'
                },
                slotDuration: '01:00:00',
                allDaySlot: false,
                height: '600'
            })
    
            this.calendar.render()
        }
    });
});