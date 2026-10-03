package com.pigment.controller;

import com.pigment.model.Paleta;
import com.pigment.service.PaletaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paletas")
public class PaletaController {

    private final PaletaService paletaService;

    public PaletaController(PaletaService paletaService) {
        this.paletaService = paletaService;
    }

    @PostMapping
    public ResponseEntity<Paleta> criar(@Valid @RequestBody Paleta paleta) {
        Paleta novaPaleta = paletaService.criar(paleta);
        return ResponseEntity.ok(novaPaleta);
    }

    @GetMapping
    public ResponseEntity<List<Paleta>> listarTodas() {
        return ResponseEntity.ok(paletaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paleta> buscarPorId(@PathVariable String id) {
        return paletaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paleta> atualizar(
            @PathVariable String id,
            @Valid @RequestBody Paleta paleta) {

        return paletaService.atualizar(id, paleta)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        if (paletaService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        paletaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}