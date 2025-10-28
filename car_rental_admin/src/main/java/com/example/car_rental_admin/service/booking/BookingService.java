package com.example.car_rental_admin.service.booking;

import com.example.car_rental_admin.model.Booking;

import com.example.car_rental_admin.repository.IBookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {
    private final IBookingRepository bookingRepo;

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepo.findAll();
    }
}
