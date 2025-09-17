package com.livrolivre.controller;

import com.livrolivre.service.EmprestimoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrinho")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    @DeleteMapping("/{emprestimoId}")
    public ResponseEntity<Void> removerDoCarrinho(@PathVariable Long emprestimoId) {
        emprestimoService.removerDoCarrinho(emprestimoId);
        return ResponseEntity.noContent().build();
    }
}