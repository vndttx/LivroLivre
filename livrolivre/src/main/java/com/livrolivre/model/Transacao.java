package com.livrolivre.model;

import com.livrolivre.model.enums.StatusTransacao;
import com.livrolivre.model.enums.TipoTransacao;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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
    private Usuario solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private Usuario proprietario;

    @ManyToOne
    @JoinColumn(name = "livro_solicitado_id")
    private Livro livroSolicitado;

    @ManyToOne
    @JoinColumn(name = "livro_ofertado_id")
    private Livro livroOfertado;

    @Column(nullable = false)
    private LocalDateTime data;
}