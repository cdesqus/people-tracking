import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@store/store';
import { addBranch, deleteBranch, Branch } from '@store/slices/branchSlice';
import { Card, Button, Input } from '@components/common';
import toast from 'react-hot-toast';

const Branches: React.FC = () => {
  const dispatch = useAppDispatch();
  const branches = useAppSelector((state) => state.branches.branches);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Branch name is required';
    if (!code.trim()) {
      newErrors.code = 'Branch code is required';
    } else if (branches.some((b) => b.code.toUpperCase() === code.trim().toUpperCase())) {
      newErrors.code = 'This branch code already exists';
    }
    if (!city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(
      addBranch({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        city: city.trim(),
      })
    );

    toast.success('Branch added successfully!');
    setName('');
    setCode('');
    setCity('');
    setErrors({});
  };

  const handleDeleteClick = (branch: Branch) => {
    // Prevent deleting Headquarters
    if (branch.id === 'br-hq') {
      toast.error('Cannot delete the main Headquarters branch!');
      return;
    }
    setSelectedBranch(branch);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedBranch) {
      dispatch(deleteBranch(selectedBranch.id));
      toast.success(`Deleted branch ${selectedBranch.name}`);
    }
    setShowDeleteConfirm(false);
    setSelectedBranch(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Branch Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure and manage geographical branches for cameras, employees, and traffic analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left/Middle Column: Branch List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branches.map((branch) => (
              <Card 
                key={branch.id} 
                className="p-5 relative group border border-gray-250 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all shadow-md bg-white dark:bg-slate-900 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Line */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 px-2 py-0.5 rounded uppercase">
                      {branch.code}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ID: {branch.id}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {branch.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {branch.city}
                    </p>
                  </div>
                </div>

                {/* Footer Delete Action */}
                <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleDeleteClick(branch)}
                    className="text-xs font-mono font-bold text-red-500 hover:text-red-650 flex items-center gap-1 active:scale-95 transition-transform"
                    title={branch.id === 'br-hq' ? 'Main Headquarters cannot be deleted' : 'Delete this branch'}
                    disabled={branch.id === 'br-hq'}
                    style={{ opacity: branch.id === 'br-hq' ? 0.4 : 1 }}
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    Delete Branch
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Add New Branch Form */}
        <div className="col-span-1">
          <Card title="Register New Branch" subtitle="Add a new office or shop branch location">
            <form onSubmit={handleAddBranch} className="space-y-4">
              <Input
                label="Branch Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Surabaya Branch"
                hasError={!!errors.name}
                error={errors.name}
                required
              />

              <Input
                label="Branch Code (Uppercase)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., SBY-02"
                hasError={!!errors.code}
                error={errors.code}
                required
              />

              <Input
                label="City Location"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Surabaya"
                hasError={!!errors.city}
                error={errors.city}
                required
              />

              <div className="pt-3">
                <Button type="submit" className="w-full">
                  + Add Branch
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Branch Confirmation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Are you sure you want to delete the branch <strong>{selectedBranch.name} ({selectedBranch.code})</strong>?
                This will remove its mapping filter configurations in dashboards. Cameras associated with this branch will fallback to default locations.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedBranch(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Branches;
