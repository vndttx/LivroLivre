package com.livrolivre.repository;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.FirestoreOptions;
import com.livrolivre.model.Usuario;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import static org.junit.jupiter.api.Assertions.*;

public class UsuarioRepositoryTest {

    private static Firestore firestore;
    private UsuarioRepository usuarioRepository;

    @BeforeAll
    public static void setupFirebaseEmulator() {
        String emulatorHost = System.getenv("FIRESTORE_EMULATOR_HOST");
        if (emulatorHost == null) {
            System.setProperty("FIRESTORE_EMULATOR_HOST", "localhost:8080");
        }
        firestore = FirestoreOptions.getDefaultInstance().getService();
    }

    @BeforeEach
    public void init() throws ExecutionException, InterruptedException {
        usuarioRepository = new UsuarioRepository(firestore);
        for (var doc : firestore.collection("usuarios").get().get().getDocuments()) {
            doc.getReference().delete().get();
        }
    }

    @Test
    public void deveSalvarNovoUsuarioComSucesso() throws ExecutionException, InterruptedException {
        Usuario usuario = new Usuario("Emanuel", "emanuel@teste.com", "senha123");

        Usuario salvo = usuarioRepository.save(usuario);

        assertNotNull(salvo.getId());
        assertEquals("Emanuel", salvo.getNome());
    }

    @Test
    public void deveBuscarUsuarioPorId() throws ExecutionException, InterruptedException {
        Usuario usuario = new Usuario("Dev Teste", "dev@teste.com", "senha123");
        Usuario salvo = usuarioRepository.save(usuario);

        Optional<Usuario> encontrado = usuarioRepository.findById(salvo.getId());

        assertTrue(encontrado.isPresent());
        assertEquals(salvo.getId(), encontrado.get().getId());
        assertEquals("dev@teste.com", encontrado.get().getEmail());
    }

    @Test
    public void deveRetornarVazioQuandoBuscarIdInexistente() throws ExecutionException, InterruptedException {
        Optional<Usuario> encontrado = usuarioRepository.findById("999999L");
        assertTrue(encontrado.isEmpty());
    }

    @Test
    public void deveBuscarUsuarioPorEmailComSucesso() throws ExecutionException, InterruptedException {
        Usuario usuario = new Usuario("Busca Email", "busca@teste.com", "senha123");
        usuarioRepository.save(usuario);

        Optional<Usuario> encontrado = usuarioRepository.findByEmail("busca@teste.com");

        assertTrue(encontrado.isPresent());
        assertEquals("Busca Email", encontrado.get().getNome());
    }

    @Test
    public void deveAtualizarDadosDeUsuarioExistente() throws ExecutionException, InterruptedException {
        Usuario usuario = new Usuario("Nome Antigo", "update@teste.com", "senha123");
        Usuario salvo = usuarioRepository.save(usuario);

        salvo.setNome("Nome Updated");
        Usuario atualizado = usuarioRepository.save(salvo);

        Optional<Usuario> encontrado = usuarioRepository.findById(atualizado.getId());
        assertTrue(encontrado.isPresent());
        assertEquals("Nome Updated", encontrado.get().getNome());
        assertEquals(salvo.getId(), encontrado.get().getId());
    }
}