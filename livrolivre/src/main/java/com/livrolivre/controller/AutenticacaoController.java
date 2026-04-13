package com.livrolivre.controller;

import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.security.JwtTokenUtil;
import com.livrolivre.security.LoginResponse;
import com.livrolivre.service.UsuarioService;
import com.livrolivre.repository.UsuarioRepository;
import com.livrolivre.model.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioService usuarioService;
    private final JwtTokenUtil jwtTokenUtil;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public AutenticacaoController(
            AuthenticationManager authenticationManager,
            UsuarioService usuarioService,
            JwtTokenUtil jwtTokenUtil,
            UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.usuarioService = usuarioService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody LoginRequest loginRequest) throws Exception {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getSenha())
        );

        final UserDetails userDetails = usuarioService.loadUserByUsername(loginRequest.getEmail());

        Usuario usuario = usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado após autenticação."));

        final String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(new LoginResponse(token, usuario.getId()));
    }
}