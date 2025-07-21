const mongoose = require('mongoose')

// Kết nối DB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

    .then(() => console.log('Kết nối MongoDB thành công'))
    .catch((err) => {
        console.error('MongoDB connect error:', err)
        process.exit(1)
    })

const Club = require('./models/Club')
const Table = require('./models/Table')
const Booking = require('./models/Booking')
const Tournament = require('./models/Tournament')


async function seed() {
    try {
        // Xoá sạch dữ liệu cũ
        await Club.deleteMany({})
        await Table.deleteMany({})
        await Booking.deleteMany({})
        await Tournament.deleteMany({})

        // Thêm user
       
        // Thêm club
        const club = await Club.create({
            name: 'Billiards 123',
            address: '123 Đường Lớn, Q.1, TP.HCM',
            phone: '0901234567',
            email: 'billiards123@example.com',
            description: 'Quán bida lớn, sạch sẽ, đầy đủ tiện nghi.',
            images: ['https://images.unsplash.com/photo-1464983953574-0892a716854b'],
            rating: 4.5,
            totalRatings: 10,
            pricePerHour: 80000,
            openingHours: { open: '07:00', close: '23:00' },
            location: { type: 'Point', coordinates: [106.700987, 10.776530] },
            amenities: ['parking', 'wifi', 'vip_room'],
            isActive: true,
            owner: user._id
        })

        // Thêm table
        const tables = await Table.insertMany([
            {
                number: 1,
                type: 'VIP',
                status: 'available',
                club: club._id,
                pricePerHour: 120000,
                description: 'Bàn VIP, có máy lạnh',
                features: ['air_conditioning', 'premium_cushions'],
                isActive: true
            },
            {
                number: 2,
                type: 'Standard',
                status: 'occupied',
                club: club._id,
                pricePerHour: 80000,
                description: 'Bàn tiêu chuẩn',
                features: ['led_lighting'],
                isActive: true
            },
            {
                number: 3,
                type: 'Standard',
                status: 'available',
                club: club._id,
                pricePerHour: 80000,
                description: 'Bàn thường',
                isActive: true
            }
        ])

        // Thêm booking cho bàn số 2 (occupied)
        await Booking.create({
            user: user._id,
            club: club._id,
            table: tables[1]._id,
            startTime: new Date(Date.now() - 60 * 60 * 1000),
            endTime: new Date(Date.now() + 60 * 60 * 1000),
            duration: 2,
            totalPrice: 160000,
            bookingType: 'hourly',
            status: 'active',
            paymentStatus: 'paid',
            paymentMethod: 'cash',
            notes: 'Khách đặt trước'
        })

        // Thêm tournament
        await Tournament.create({
            name: 'Giải Billiards T7',
            description: 'Giải đấu friendly.',
            club: club._id,
            startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            startTime: '09:00',
            maxParticipants: 16,
            currentParticipants: 4,
            entryFee: 100000,
            prizePool: 3000000,
            prizes: [
                { rank: 1, amount: 2000000, description: 'Vô địch' },
                { rank: 2, amount: 1000000, description: 'Á quân' }
            ],
            status: 'open',
            tournamentType: 'single_elimination',
            organizer: user._id,
            participants: [
                { user: user._id, paymentStatus: 'paid' }
            ],
            images: [],
            isActive: true
        })

        console.log('🌱 Seed dữ liệu thành công!')
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

seed()
