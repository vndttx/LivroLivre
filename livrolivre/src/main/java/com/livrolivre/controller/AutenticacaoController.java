package com.livrolivre.controller;

import com.livrolivre.controller.dto.DadosTokenJWT;
import com.livrolivre.controller.dto.LoginRequest;
import com.livrolivre.security.JwtTokenUtil;
import com.livrolivre.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/autenticacao")
public class AutenticacaoController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/login")
    public ResponseEntity<?> efetuarLogin(@RequestBody @Valid LoginRequest dados) {
        var authenticationToken = new UsernamePasswordAuthenticationToken(dados.email(), dados.senha());
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        var usuario = (Usuario) authentication.getPrincipal();
        var tokenJWT = jwtTokenUtil.generateToken(usuario);

        return ResponseEntity.ok(new DadosTokenJWT(tokenJWT, usuario.getId()));
    }
}