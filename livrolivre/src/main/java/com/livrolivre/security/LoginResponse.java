package com.livrolivre.security;

public record LoginResponse(String jwt, Long usuarioId) {

}