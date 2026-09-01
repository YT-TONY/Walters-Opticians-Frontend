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
      <h2 className="text-base font-semibold text-[#021438]">UK Patient Consultation Requests</h2>
      <div className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#1A1A1A]">
            <thead className="bg-[#F8F6F0] border-b border-[#E5E0D8] text-[11px] font-semibold uppercase text-[#5E6470]">
              <tr>
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">UK Address</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E0D8]">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#5E6470]">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-[#5E6470]/40" />
                    No booking requests received yet.
                  </td>
                </tr>
              ) : (
                bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-[#FDFBF7]">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-[#021438]">{bkg.patientName}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-[#5E6470] mt-0.5">
                        <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {bkg.phone}</span>
                        <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {bkg.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#021438] text-white text-[10px]">
                        {bkg.serviceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-start space-x-1 text-[#5E6470]">
                        <MapPin className="w-3.5 h-3.5 text-[#021438] mt-0.5" />
                        <div>
                          <p className="text-[#021438] font-medium">{bkg.address}</p>
                          <p className="text-[10px] uppercase font-mono">{bkg.postcode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#021438]">{bkg.preferredDate}</td>
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
                        className="px-3 py-1.5 bg-[#021438] text-white rounded-md text-[11px] font-semibold"
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