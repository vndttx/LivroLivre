package com.livrolivre.service;

import com.livrolivre.model.Usuario;
import com.livrolivre.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class UsuarioService implements UserDetailsService {

    @Autowired
    private UsuarioRepository repository;

    public Optional<Usuario> findByEmail(String email) {
        try {
            return repository.findByEmail(email);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar usuário por e-mail no Firebase", e);
        }
    }

    public Optional<Usuario> findById(String id) {
        try {
            return repository.findById(id);
        } catch (ExecutionException | InterruptedException e) {
            throw new RuntimeException("Erro ao buscar usuário por ID no Firebase", e);
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            Usuario usuario = repository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + username));

            return org.springframework.security.core.userdetails.User.builder()
                    .username(usuario.getEmail())
                    .password(usuario.getSenha())
                    .authorities("ROLE_USER")
                    .build();
        } catch (ExecutionException | InterruptedException e) {
            throw new UsernameNotFoundException("Erro ao consultar o Firebase durante a autenticação", e);
        }
    }
}