package com.livrolivre.controller;

import com.livrolivre.model.Carrinho;
import com.livrolivre.service.CarrinhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    @Autowired
    private CarrinhoService carrinhoService;

    @PostMapping("/{usuarioId}/adicionar/{livroId}")
    public ResponseEntity<Carrinho> adicionarItem(
            @PathVariable String usuarioId,
            @PathVariable String livroId) {
        return ResponseEntity.ok(carrinhoService.adicionarAoCarrinho(usuarioId, livroId));
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<com.livrolivre.controller.dto.CarrinhoDTO> buscarCarrinho(@PathVariable String usuarioId) {
        return ResponseEntity.ok(carrinhoService.buscarPorUsuarioId(usuarioId));
    }

    @DeleteMapping("/{usuarioId}/remover/{livroId}")
    public ResponseEntity<com.livrolivre.controller.dto.CarrinhoDTO> removerItem(
            @PathVariable String usuarioId,
            @PathVariable String livroId) {
        return ResponseEntity.ok(carrinhoService.removerDoCarrinho(usuarioId, livroId));
    }
}