package com.livrolivre.model;

import com.livrolivre.model.enums.StatusLivro;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Livro {
    private String id;
    private String titulo;
    private String genero;
    private String autor;
    private int estoque;
    private StatusLivro status;
    private Usuario proprietario;
}