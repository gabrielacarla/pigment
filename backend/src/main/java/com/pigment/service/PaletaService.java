package com.pigment.service;

import com.pigment.model.Paleta;
import com.pigment.repository.PaletaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaletaService {

    private final PaletaRepository paletaRepository;

    public PaletaService(PaletaRepository paletaRepository) {
        this.paletaRepository = paletaRepository;
    }

    public Paleta criar(Paleta paleta) {
        return paletaRepository.save(paleta);
    }

    public List<Paleta> listarTodas() {
        return paletaRepository.findAll();
    }

    public Optional<Paleta> buscarPorId(String id) {
        return paletaRepository.findById(id);
    }

    public void excluir(String id) {
        paletaRepository.deleteById(id);
    }
}