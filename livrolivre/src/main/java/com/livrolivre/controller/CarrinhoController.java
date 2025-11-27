package com.livrolivre.controller;

import com.livrolivre.model.Carrinho;
import com.livrolivre.service.CarrinhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/carrinho")
public class CarrinhoController {

    @Autowired
    private CarrinhoService carrinhoService;

    @GetMapping("/{usuarioId}")
    public List<Carrinho> getCarrinhoByUsuario(@PathVariable Long usuarioId) {
        return carrinhoService.findByUsuarioId(usuarioId);
    }

    @PostMapping("/{usuarioId}/adicionar/{livroId}")
    public ResponseEntity<Carrinho> adicionarItemCarrinho(
            @PathVariable Long usuarioId,
            @PathVariable Long livroId) {
        Carrinho item = carrinhoService.adicionarItemCarrinho(usuarioId, livroId);
        if (item != null) {
            return ResponseEntity.ok(item);
        }
        return ResponseEntity.badRequest().build();
    }

    @DeleteMapping("/{usuarioId}/remover/{livroId}")
    public ResponseEntity<Void> removerItemCarrinho(@PathVariable Long itemId) {
        if (carrinhoService.removerItemCarrinho(itemId)) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}