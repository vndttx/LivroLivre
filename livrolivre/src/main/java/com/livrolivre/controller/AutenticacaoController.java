package com.livrolivre.controller;
import com.livrolivre.model.Usuario;
import com.livrolivre.security.JwtTokenUtil;
import com.livrolivre.security.LoginResponse;
import com.livrolivre.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

import org.springframework.security.core.AuthenticationException;
import com.livrolivre.controller.dto.LoginRequest;

@RestController
public class AutenticacaoController {

    private final AuthenticationManager authenticationManager;

    private final UsuarioService usuarioService;

    private final JwtTokenUtil jwtTokenUtil;

    public AutenticacaoController(AuthenticationManager authenticationManager, UsuarioService usuarioService, JwtTokenUtil jwtTokenUtil) {
        this.authenticationManager = authenticationManager;
        this.usuarioService = usuarioService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @PostMapping("/api/autenticacao/login")
    public ResponseEntity<?> autenticarUsuario(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getNomeUsuario(), loginRequest.getSenha())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            Usuario usuario = usuarioService.buscarPorNomeUsuario(userDetails.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuario nao encontrado"));

            String jwt = jwtTokenUtil.generateToken(userDetails);

            return ResponseEntity.ok(new LoginResponse(jwt, usuario.getId()));

        } catch (AuthenticationException e) {
            String mensagem = "Usuario ou senha incorreta.";
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(mensagem);
        }
    }
}