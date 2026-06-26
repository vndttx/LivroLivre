package com.livrolivre.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
public class Carrinho {
    private String usuarioId;
    private List<String> livroIds;

    public Carrinho() {
        this.livroIds = new ArrayList<>();
    }

    public Carrinho(String usuarioId) {
        this.usuarioId = usuarioId;
        this.livroIds = new ArrayList<>();
    }
}