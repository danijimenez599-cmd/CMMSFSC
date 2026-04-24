import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Modal, Button, FormField, Input, Select, Textarea } from '../../../shared/components';
import { Asset, AssetInput, AssetType, AssetCategory, AssetCriticality, AssetStatus } from '../types';
import { ASSET_TYPE_LABELS, CATEGORY_LABELS } from '../utils/assetHelpers';

interface AssetFormProps {
  isOpen: boolean;
  asset?: Asset | null;
  defaultParentId?: string | null;
  onClose: () => void;
}

const EMPTY: AssetInput = {
  name: '',
  parentId: null,
  assetType: 'equipment',
  category: 'rotating',
  criticality: 'medium',
  status: 'active',
  code: '',
  manufacturer: '',
  model: '',
  serialNumber: '',
  description: '',
};

export default function AssetForm({ isOpen, asset, defaultParentId, onClose }: AssetFormProps) {
  const { assets, createAsset, updateAsset, showToast } = useStore() as any;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<AssetInput>(() => asset ? {
    name: asset.name,
    parentId: asset.parentId,
    assetType: asset.assetType,
    category: asset.category,
    criticality: asset.criticality,
    status: asset.status,
    code: asset.code || '',
    manufacturer: asset.manufacturer || '',
    model: asset.model || '',
    serialNumber: asset.serialNumber || '',
    description: asset.description || '',
    installDate: asset.installDate || '',
    warrantyUntil: asset.warrantyUntil || '',
  } : { ...EMPTY, parentId: defaultParentId || null });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value || null }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'El nombre es requerido.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (asset) {
        await updateAsset(asset.id, form);
        showToast({ type: 'success', title: 'Activo actualizado' });
      } else {
        await createAsset(form);
        showToast({ type: 'success', title: 'Activo creado' });
      }
      onClose();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Available parents (excluding self and descendants)
  const parentOptions = assets.filter((a: Asset) => a.id !== asset?.id);

  return (
    <Modal
      isOpen={isOpen}
      title={asset ? `Editar: ${asset.name}` : 'Nuevo Activo'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {asset ? 'Guardar cambios' : 'Crear activo'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nombre" required error={errors.name} className="sm:col-span-2">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Nombre del activo"
              autoFocus
            />
          </FormField>

          <FormField label="TAG / Código">
            <Input
              name="code"
              value={form.code || ''}
              onChange={handleChange}
              placeholder="Ej. COMP-A, TK-001"
              className="font-mono"
            />
          </FormField>

          <FormField label="Activo padre">
            <Select name="parentId" value={form.parentId || ''} onChange={handleChange}>
              <option value="">Sin padre (raíz)</option>
              {parentOptions.map((a: Asset) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Tipo de activo">
            <Select name="assetType" value={form.assetType} onChange={handleChange}>
              {Object.entries(ASSET_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Categoría">
            <Select name="category" value={form.category || ''} onChange={handleChange}>
              <option value="">Sin categoría</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </FormField>

          <FormField label="Criticidad">
            <Select name="criticality" value={form.criticality} onChange={handleChange}>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </Select>
          </FormField>

          <FormField label="Estado">
            <Select name="status" value={form.status} onChange={handleChange}>
              <option value="active">Activo</option>
              <option value="standby">En espera</option>
              <option value="decommissioned">Dado de baja</option>
            </Select>
          </FormField>

          <FormField label="Fabricante">
            <Input name="manufacturer" value={form.manufacturer || ''} onChange={handleChange} placeholder="Ej. Ariel, Siemens" />
          </FormField>

          <FormField label="Modelo">
            <Input name="model" value={form.model || ''} onChange={handleChange} placeholder="Número de modelo" />
          </FormField>

          <FormField label="Número de serie">
            <Input name="serialNumber" value={form.serialNumber || ''} onChange={handleChange} placeholder="S/N" />
          </FormField>

          <FormField label="Fecha de instalación">
            <Input type="date" name="installDate" value={form.installDate || ''} onChange={handleChange} />
          </FormField>

          <FormField label="Garantía hasta">
            <Input type="date" name="warrantyUntil" value={form.warrantyUntil || ''} onChange={handleChange} />
          </FormField>

          <FormField label="Descripción" className="sm:col-span-2">
            <Textarea name="description" value={form.description || ''} onChange={handleChange} rows={2} placeholder="Descripción del activo..." />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
