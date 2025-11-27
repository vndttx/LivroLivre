package com.livrolivre.model;

import com.livrolivre.model.enums.StatusLivro;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import lombok.EqualsAndHashCode;

@Data
@Entity
@Table(name = "livros")
public class Livro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String autor;
    @Column(nullable = true)
    private String genero;
    private Integer estoque;

    @Enumerated(EnumType.STRING)
    private StatusLivro status;


    @ManyToOne
    @JoinColumn(name = "proprietario_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Usuario proprietario;
}