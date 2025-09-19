package com.livrolivre.model;

import com.livrolivre.model.enums.StatusLivro;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "livros")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    private String genero;
    private int estoque;

    @Enumerated(EnumType.STRING)
    private StatusLivro status;

    @ManyToOne
    @JoinColumn(name = "proprietario_id")
    private Usuario proprietario;
}