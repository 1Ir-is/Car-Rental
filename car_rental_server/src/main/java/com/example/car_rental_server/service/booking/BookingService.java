package com.example.car_rental_server.service.booking;

import com.example.car_rental_server.dto.BookingDTO;
import com.example.car_rental_server.enums.BookingStatus;
import com.example.car_rental_server.enums.VehicleStatus;
import com.example.car_rental_server.model.Booking;
import com.example.car_rental_server.model.PostVehicle;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IBookingRepository;
import com.example.car_rental_server.repository.IPostVehicleRepository;
import com.example.car_rental_server.repository.IUserRepository;
import com.example.car_rental_server.service.notification.INotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService implements IBookingService {
    private final IBookingRepository bookingRepo;
    private final IUserRepository userRepo;
    private final IPostVehicleRepository vehicleRepo;
    private final INotificationService notificationService;

    @Override
    public BookingDTO createBooking(BookingDTO dto) {
        Optional<User> userOpt = userRepo.findById(dto.getUserId());
        Optional<PostVehicle> vehicleOpt = vehicleRepo.findById(dto.getVehicleId());
        if (userOpt.isEmpty()) {
            System.out.println("ERROR: Không tìm thấy user với id = " + dto.getUserId());
            return null;
        }
        if (vehicleOpt.isEmpty()) {
            System.out.println("ERROR: Không tìm thấy xe với id = " + dto.getVehicleId());
            return null;
        }
        User user = userOpt.get();
        PostVehicle vehicle = vehicleOpt.get();
        User owner = vehicle.getOwner();

        long days = java.time.temporal.ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate());
        if (days <= 0) days = 1; // ít nhất 1 ngày

        double total = vehicle.getDailyPrice() * days;

        Booking booking = Booking.builder()
                .user(user)
                .owner(owner)
                .vehicle(vehicle)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .pickupLocation(dto.getPickupLocation())
                .dropoffLocation(dto.getDropoffLocation())
                .totalAmount(total) // <-- set tổng tiền
                .status(BookingStatus.PENDING)
                .note(dto.getNote())
                .bookingDate(java.time.LocalDateTime.now())
                .build();

        booking = bookingRepo.save(booking);

        // Sau khi booking thành công, gửi thông báo cho owner
        notificationService.notifyOwnerNewBooking(
                booking.getOwner().getId(),
                booking.getVehicle().getVehicleName(),
                booking.getUser().getName(),
                booking.getStartDate(),
                booking.getEndDate()
        );
        return toDTO(booking);
    }

    @Override
    public List<BookingDTO> getMyBookings(Long userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return List.of();
        return bookingRepo.findAllByUser(userOpt.get())
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingDTO> getOwnerBookings(Long ownerId) {
        Optional<User> ownerOpt = userRepo.findById(ownerId);
        if (ownerOpt.isEmpty()) return List.of();
        return bookingRepo.findAllByOwner(ownerOpt.get())
                .stream().map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookingDTO getBookingDetail(UUID bookingId) {
        return bookingRepo.findById(bookingId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public BookingDTO confirmBooking(UUID bookingId, Long ownerId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) return null;
        Booking booking = bookingOpt.get();
        if (!booking.getOwner().getId().equals(ownerId)) return null;

        // Cập nhật trạng thái booking
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepo.save(booking);

        // Cập nhật trạng thái xe
        PostVehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.RENTED); // <-- sử dụng enum
        vehicleRepo.save(vehicle);

        return toDTO(booking);
    }

    @Override
    public BookingDTO cancelBooking(UUID  bookingId, Long requesterId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) return null;
        Booking booking = bookingOpt.get();
        if (!booking.getUser().getId().equals(requesterId) && !booking.getOwner().getId().equals(requesterId)) return null;
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepo.save(booking);
        return toDTO(booking);
    }

    @Override
    public BookingDTO completeBooking(UUID bookingId, Long ownerId) {
        Optional<Booking> bookingOpt = bookingRepo.findById(bookingId);
        if (bookingOpt.isEmpty()) return null;
        Booking booking = bookingOpt.get();
        if (!booking.getOwner().getId().equals(ownerId)) return null;

        // Đánh dấu booking đã hoàn tất
        booking.setStatus(BookingStatus.COMPLETED);
        booking = bookingRepo.save(booking);

        // Đặt lại trạng thái xe thành AVAILABLE
        PostVehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepo.save(vehicle);

        return toDTO(booking);
    }

    // Helper convert entity to DTO
    private BookingDTO toDTO(Booking booking) {
        PostVehicle vehicle = booking.getVehicle();
        return BookingDTO.builder()
                .id(booking.getId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .userAvatar(booking.getUser().getAvatar())
                .ownerId(booking.getOwner().getId())
                .ownerName(booking.getOwner().getName())
                .ownerAvatar(booking.getOwner().getAvatar())
                .vehicleId(vehicle.getId())
                .vehicleName(vehicle.getVehicleName())
                .vehicleImages(vehicle.getImageList())  // <-- gán imageList vào DTO
                .startDate(booking.getStartDate())
                .endDate(booking.getEndDate())
                .pickupLocation(booking.getPickupLocation())
                .dropoffLocation(booking.getDropoffLocation())
                .totalAmount(booking.getTotalAmount())
                .vehicleDailyPrice(vehicle.getDailyPrice())
                .status(booking.getStatus())
                .note(booking.getNote())
                .bookingDate(booking.getBookingDate())
                .build();
    }

}