import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Modal, Button, FormField, Input, Select, Textarea } from '../../../shared/components';
import { InventoryItem, InventoryItemInput } from '../types';

interface InventoryItemFormProps {
  isOpen: boolean;
  item?: InventoryItem | null;
  onClose: () => void;
}

const CATEGORIES = ['Lubricantes', 'Filtros', 'Sellos/Empaques', 'Rodamientos', 'Eléctricos', 'Hidráulicos', 'Neumáticos', 'Herramientas', 'Consumibles', 'Repuestos generales', 'Otro'];
const UNITS = ['und', 'gal', 'lt', 'kg', 'lb', 'm', 'ft', 'par', 'caja', 'rollo'];

export default function InventoryItemForm({ isOpen, item, onClose }: InventoryItemFormProps) {
  const { createItem, updateItem, showToast } = useStore() as any;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<InventoryItemInput>(() => item ? {
    name: item.name,
    partNumber: item.partNumber || '',
    description: item.description || '',
    category: item.category || '',
    unit: item.unit,
    stockCurrent: item.stockCurrent,
    stockMin: item.stockMin,
    stockMax: item.stockMax ?? undefined,
    locationBin: item.locationBin || '',
    unitCost: item.unitCost ?? undefined,
    supplierRef: item.supplierRef || '',
  } : {
    name: '',
    partNumber: '',
    description: '',
    category: '',
    unit: 'und',
    stockCurrent: 0,
    stockMin: 1,
    locationBin: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : (value || undefined),
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = 'El nombre es requerido.';
    if (!form.unit) errs.unit = 'Selecciona la unidad.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (item) {
        await updateItem(item.id, form);
        showToast({ type: 'success', title: 'Artículo actualizado' });
      } else {
        await createItem(form);
        showToast({ type: 'success', title: 'Artículo creado' });
      }
      onClose();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={item ? `Editar: ${item.name}` : 'Nuevo Artículo'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {item ? 'Guardar' : 'Crear artículo'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nombre" required error={errors.name} className="sm:col-span-2">
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre del artículo" autoFocus />
          </FormField>

          <FormField label="Número de parte">
            <Input name="partNumber" value={form.partNumber || ''} onChange={handleChange} placeholder="Ej. OIL-5W30-1GL" className="font-mono" />
          </FormField>

          <FormField label="Categoría">
            <Select name="category" value={form.category || ''} onChange={handleChange}>
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FormField>

          <FormField label="Unidad" required error={errors.unit}>
            <Select name="unit" value={form.unit} onChange={handleChange}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
          </FormField>

          <FormField label="Costo unitario (USD)">
            <Input type="number" name="unitCost" value={form.unitCost ?? ''} onChange={handleChange} min={0} step={0.01} placeholder="0.00" />
          </FormField>

          {!item && (
            <FormField label="Stock inicial">
              <Input type="number" name="stockCurrent" value={form.stockCurrent ?? 0} onChange={handleChange} min={0} step={1} />
            </FormField>
          )}

          <FormField label="Stock mínimo">
            <Input type="number" name="stockMin" value={form.stockMin ?? 1} onChange={handleChange} min={0} step={1} />
          </FormField>

          <FormField label="Stock máximo">
            <Input type="number" name="stockMax" value={form.stockMax ?? ''} onChange={handleChange} min={0} step={1} placeholder="Sin límite" />
          </FormField>

          <FormField label="Ubicación / Bin">
            <Input name="locationBin" value={form.locationBin || ''} onChange={handleChange} placeholder="Ej. Bodega A, Estante 3" />
          </FormField>

          <FormField label="Ref. proveedor">
            <Input name="supplierRef" value={form.supplierRef || ''} onChange={handleChange} placeholder="Código del proveedor" />
          </FormField>

          <FormField label="Descripción" className="sm:col-span-2">
            <Textarea name="description" value={form.description || ''} onChange={handleChange} rows={2} placeholder="Descripción o notas adicionales..." />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
