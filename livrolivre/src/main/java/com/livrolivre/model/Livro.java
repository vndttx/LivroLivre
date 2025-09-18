package com.livrolivre.model;

import com.livrolivre.model.enums.StatusLivro;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "livros")
@Data
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    private String genero;
    private String sinopse;
    private Integer estoque;

    @Enumerated(EnumType.STRING)
    private StatusLivro status;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proprietario_id")
    private Usuario proprietario;
}