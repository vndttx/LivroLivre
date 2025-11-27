package com.livrolivre.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importante para Lazy Loading
import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transacoes")
@Data
public class Transacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoTransacao tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusTransacao status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "transacoes", "senha"})
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "transacoes", "senha"})
    private Usuario proprietario;

    @ManyToOne
    @JoinColumn(name = "livro_solicitado_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livro livroSolicitado;

    @ManyToOne
    @JoinColumn(name = "livro_ofertado_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Livro livroOfertado;

    @Column(nullable = false)
    private LocalDateTime data;
}