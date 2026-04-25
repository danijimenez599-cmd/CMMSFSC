import React, { useState } from 'react';
import { useStore } from '../../../store';
import { Button, Input, Badge } from '../../../shared/components';
import { Truck, Plus, Trash2, Mail, Phone, Hash, User } from 'lucide-react';
import { Vendor } from '../types';

export default function VendorsPanel() {
  const { vendors, saveVendor, deleteVendor } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    taxId: ''
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setFormData({
      name: vendor.name,
      contactName: vendor.contactName || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      taxId: vendor.taxId || ''
    });
    setShowAdd(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    await saveVendor({
      id: editingId || undefined,
      ...formData,
      isActive: true
    });

    setFormData({ name: '', contactName: '', email: '', phone: '', taxId: '' });
    setEditingId(null);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-tx tracking-tight">Catálogo de Proveedores</h2>
          <p className="text-sm text-tx-4 mt-0.5">
            Gestiona las empresas externas que realizan servicios de mantenimiento.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => {
          setEditingId(null);
          setFormData({ name: '', contactName: '', email: '', phone: '', taxId: '' });
          setShowAdd(!showAdd);
        }}>
          Nuevo Proveedor
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAdd && (
        <form
          onSubmit={handleSave}
          className="bg-white border border-border rounded-2xl shadow-sm p-6 space-y-4 animate-slide-up"
        >
          <h3 className="font-semibold text-tx flex items-center gap-2">
            <Truck size={18} className="text-brand" />
            {editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre de la Empresa"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej. Servicios Industriales S.A."
              autoFocus
              required
            />
            <Input
              label="Contacto Principal"
              value={formData.contactName}
              onChange={e => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Nombre del técnico o gestor"
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="proveedor@empresa.com"
            />
            <Input
              label="Teléfono"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+503 1234 5678"
            />
            <Input
              label="NIT / Registro Fiscal"
              value={formData.taxId}
              onChange={e => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="0614-010101-101-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border mt-4">
            <Button variant="ghost" type="button" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Actualizar' : 'Guardar Proveedor'}
            </Button>
          </div>
        </form>
      )}

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vendors.length > 0 ? (
          vendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className="bg-white border border-border rounded-2xl p-5 hover:border-brand/50 transition-all group relative shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-bg-3 flex items-center justify-center text-tx-3 group-hover:bg-brand group-hover:text-white transition-colors">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-tx text-lg">{vendor.name}</h4>
                    <p className="text-xs text-tx-4 flex items-center gap-1">
                      <Hash size={10} /> {vendor.taxId || 'Sin registro fiscal'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button variant="ghost" size="sm" onClick={() => handleEdit(vendor)}>Editar</Button>
                   <button 
                    onClick={() => deleteVendor(vendor.id)}
                    className="p-2 text-tx-4 hover:text-danger hover:bg-danger-bg rounded-xl transition-colors"
                   >
                    <Trash2 size={16} />
                   </button>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-tx-2">
                  <User size={14} className="text-tx-4" />
                  <span>{vendor.contactName || 'Sin contacto'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-tx-2">
                  <Mail size={14} className="text-tx-4" />
                  <span>{vendor.email || 'Sin correo'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-tx-2">
                  <Phone size={14} className="text-tx-4" />
                  <span>{vendor.phone || 'Sin teléfono'}</span>
                </div>
              </div>

              {vendor.isActive ? (
                <div className="absolute bottom-5 right-5">
                  <Badge variant="ok" dot>Activo</Badge>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-bg-2 rounded-3xl border border-dashed border-border">
            <Truck size={40} className="mx-auto mb-4 opacity-10" />
            <p className="text-tx-3 font-medium">No hay proveedores registrados</p>
            <p className="text-tx-4 text-sm mt-1">Añade contratistas externos para llevar el control de costos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
