//src/pages/admin/BookingsTab.tsx
import React from 'react';
import { Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { type UKBookingRequest } from '../../types/admin';

interface BookingsTabProps {
  bookings: UKBookingRequest[];
  onToggleStatus: (id: string) => void;
}

export const BookingsTab: React.FC<BookingsTabProps> = ({ bookings, onToggleStatus }) => {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-base font-semibold text-navy">UK Patient Consultation Requests</h2>
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-charcoal">
            <thead className="bg-[#F8F6F0] border-b border-border text-[11px] font-semibold uppercase text-slate">
              <tr>
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">UK Address</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-slate/40" />
                    No booking requests received yet.
                  </td>
                </tr>
              ) : (
                bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-[#FDFBF7]">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-navy">{bkg.patientName}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-slate mt-0.5">
                        <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {bkg.phone}</span>
                        <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {bkg.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-navy text-white text-[10px]">
                        {bkg.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-1 text-slate">
                        <MapPin className="w-3.5 h-3.5 text-navy mt-0.5" />
                        <div>
                          <p className="text-navy font-medium">{bkg.address}</p>
                          <p className="text-[10px] uppercase font-mono">{bkg.postcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-navy">{bkg.preferredDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        bkg.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {bkg.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(bkg.id)}
                        className="px-3 py-1.5 bg-navy text-white rounded-md text-[11px] font-semibold"
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};