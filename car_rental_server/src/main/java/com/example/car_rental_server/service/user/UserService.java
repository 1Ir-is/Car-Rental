package com.example.car_rental_server.service.user;

import com.example.car_rental_server.dto.UserProfileDTO;
import com.example.car_rental_server.model.User;
import com.example.car_rental_server.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User save(User user) {
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            if (user.getId() == null || !user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(user.getPassword()));
            }
        }
        return userRepository.save(user);
    }

    @Override
    public Boolean existedByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public void remove(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public UserProfileDTO getCurrentUserInfo(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileDTO.from(user);
    }

    @Override
    public UserProfileDTO updateCurrentUserInfo(String email, UserProfileDTO userUpdateDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(userUpdateDTO.getName());
        user.setPhone(userUpdateDTO.getPhone());
        user.setAddress(userUpdateDTO.getAddress());
        user.setAvatar(userUpdateDTO.getAvatar());
        userRepository.save(user);
        return UserProfileDTO.from(user);
    }
}