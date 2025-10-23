package com.example.car_rental_admin.service.vehicle;

import com.example.car_rental_admin.enums.VehicleStatus;
import com.example.car_rental_admin.model.PostVehicle;
import com.example.car_rental_admin.model.User;
import com.example.car_rental_admin.repository.IPostVehicleRepository;
import com.example.car_rental_admin.utils.MailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import org.springframework.web.client.RestTemplate;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostVehicleAdminService implements IPostVehicleAdminService {
    private final IPostVehicleRepository postVehicleRepository;
    private final MailService mailService;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${owner.service.url:http://localhost:8080}")
    private String ownerServiceBaseUrl;

    @Override
    public Page<PostVehicle> searchVehicles(String query, String brand, String status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);

        VehicleStatus enumStatus = null;
        if (status != null && !status.isBlank()) {
            try {
                enumStatus = VehicleStatus.valueOf(status.toUpperCase());
            } catch (Exception e) {
                enumStatus = null;
            }
        }

        if (brand != null && !brand.isBlank() && enumStatus != null) {
            return postVehicleRepository.findByBrandIgnoreCaseAndStatus(brand, enumStatus, pageable);
        }
        return postVehicleRepository
                .findByVehicleNameContainingIgnoreCaseOrLicensePlateContainingIgnoreCaseOrBrandContainingIgnoreCase(
                        query == null ? "" : query,
                        query == null ? "" : query,
                        query == null ? "" : query,
                        pageable);
    }

    @Override
    public Optional<PostVehicle> findVehicleById(UUID id) {
        return postVehicleRepository.findById(id);
    }

    @Override
    public long countTotalVehicles() {
        return postVehicleRepository.count();
    }

    @Override
    public long countVehiclesByStatus(String status) {
        try {
            VehicleStatus enumStatus = VehicleStatus.valueOf(status.toUpperCase());
            return postVehicleRepository.countByStatus(enumStatus);
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public boolean approveVehicle(UUID id) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.PENDING) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                // clear reasons
                vehicle.setRejectionReason(null);
                vehicle.setUnavailableReason(null);
                postVehicleRepository.save(vehicle);

                // send notification mail to owner (best-effort)
                sendVehicleApprovedMailIfPossible(vehicle);

                // ---- send realtime notification to owner via owner service ----
                String message = "Your vehicle \"" + vehicle.getVehicleName() + "\" has been approved and is now available.";
                String url = getAppUrl() + "/cars/" + vehicle.getId();
                sendOwnerRealtimeNotification(vehicle, message, url, "VEHICLE_APPROVED");

                return true;
            }
        }
        return false;
    }

    @Override
    public boolean rejectVehicle(UUID id, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.PENDING) {
                vehicle.setStatus(VehicleStatus.REJECTED);
                vehicle.setRejectionReason(reason);
                vehicle.setUnavailableReason(null);
                postVehicleRepository.save(vehicle);

                sendVehicleRejectedMailIfPossible(vehicle, reason);

                String message = "Your vehicle \"" + vehicle.getVehicleName() + "\" was rejected: " + reason + ". Please edit and resubmit.";
                String url = getAppUrl() + "/owner/vehicles/" + vehicle.getId(); // or a suitable owner edit URL
                sendOwnerRealtimeNotification(vehicle, message, url, "VEHICLE_REJECTED");

                return true;
            }
        }
        return false;
    }

    @Override
    public boolean makeUnavailable(UUID id, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.AVAILABLE) {
                vehicle.setStatus(VehicleStatus.UNAVAILABLE);
                vehicle.setUnavailableReason(reason);
                vehicle.setRejectionReason(null);
                postVehicleRepository.save(vehicle);

                sendVehicleUnavailableMailIfPossible(vehicle, reason);

                String message = "Your vehicle \"" + vehicle.getVehicleName() + "\" was marked unavailable: " + reason;
                String url = getAppUrl() + "/owner/vehicles/" + vehicle.getId();
                sendOwnerRealtimeNotification(vehicle, message, url, "VEHICLE_UNAVAILABLE");

                return true;
            }
        }
        return false;
    }

    @Override
    public boolean makeAvailable(UUID id) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            if (vehicle.getStatus() == VehicleStatus.UNAVAILABLE || vehicle.getStatus() == VehicleStatus.REJECTED) {
                vehicle.setStatus(VehicleStatus.AVAILABLE);
                vehicle.setUnavailableReason(null);
                vehicle.setRejectionReason(null);
                postVehicleRepository.save(vehicle);

                sendVehicleAvailableMailIfPossible(vehicle);

                String message = "Your vehicle \"" + vehicle.getVehicleName() + "\" is now available.";
                String url = getAppUrl() + "/cars/" + vehicle.getId();
                sendOwnerRealtimeNotification(vehicle, message, url, "VEHICLE_AVAILABLE");

                return true;
            }
        }
        return false;
    }

    @Override
    public boolean updateVehicleStatus(UUID id, VehicleStatus status, String reason) {
        Optional<PostVehicle> optionalVehicle = postVehicleRepository.findById(id);
        if (optionalVehicle.isPresent()) {
            PostVehicle vehicle = optionalVehicle.get();
            vehicle.setStatus(status);
            if (status == VehicleStatus.REJECTED) {
                vehicle.setRejectionReason(reason);
                vehicle.setUnavailableReason(null);
            } else if (status == VehicleStatus.UNAVAILABLE) {
                vehicle.setUnavailableReason(reason);
                vehicle.setRejectionReason(null);
            } else {
                vehicle.setRejectionReason(null);
                vehicle.setUnavailableReason(null);
            }
            postVehicleRepository.save(vehicle);
            return true;
        }
        return false;
    }

    // ----- Helper methods to send mails (best-effort: catch exceptions so flow isn't broken) -----
    private void sendVehicleApprovedMailIfPossible(PostVehicle vehicle) {
        try {
            User owner = vehicle.getOwner();
            if (owner != null && owner.getEmail() != null) {
                mailService.sendVehicleApprovedMail(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), getAppUrl());
            }
        } catch (MessagingException | UnsupportedEncodingException e) {
            // log and continue
            System.err.println("Failed to send vehicle approved mail: " + e.getMessage());
        }
    }

    private void sendVehicleRejectedMailIfPossible(PostVehicle vehicle, String reason) {
        try {
            User owner = vehicle.getOwner();
            if (owner != null && owner.getEmail() != null) {
                mailService.sendVehicleRejectedMail(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), reason, getAppUrl());
            }
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send vehicle rejected mail: " + e.getMessage());
        }
    }

    private void sendVehicleUnavailableMailIfPossible(PostVehicle vehicle, String reason) {
        try {
            User owner = vehicle.getOwner();
            if (owner != null && owner.getEmail() != null) {
                mailService.sendVehicleUnavailableMail(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), reason, getAppUrl());
            }
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send vehicle unavailable mail: " + e.getMessage());
        }
    }

    private void sendVehicleAvailableMailIfPossible(PostVehicle vehicle) {
        try {
            User owner = vehicle.getOwner();
            if (owner != null && owner.getEmail() != null) {
                mailService.sendVehicleAvailableMail(owner.getEmail(), owner.getName(), vehicle.getVehicleName(), getAppUrl());
            }
        } catch (MessagingException | UnsupportedEncodingException e) {
            System.err.println("Failed to send vehicle available mail: " + e.getMessage());
        }
    }

    // Replace with your app URL config or pass it as parameter / @Value if you prefer
    private String getAppUrl() {
        return "http://localhost:3000";
    }

    private void sendOwnerRealtimeNotification(PostVehicle vehicle, String message, String url, String type) {
        try {
            if (vehicle.getOwner() == null || vehicle.getOwner().getId() == null) return;
            Long ownerId = vehicle.getOwner().getId();

            // Build payload similar to owner Notification entity (simplest JSON)
            Map<String, Object> payload = new HashMap<>();
            payload.put("content", message);
            payload.put("type", type);
            payload.put("url", url);
            payload.put("isRead", false);

            String endpoint = ownerServiceBaseUrl + "/api/notifications/users/" + ownerId + "/create";

            // Server-to-server call (no credentials included here). For production add auth header.
            restTemplate.postForEntity(endpoint, payload, Object.class);
        } catch (Exception ex) {
            System.err.println("Failed to send owner realtime notification: " + ex.getMessage());
        }
    }
}