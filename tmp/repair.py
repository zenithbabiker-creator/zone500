import re

path = '/app/applet/src/components/KotlinCalculator.tsx'
with open(path, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

lines = content.splitlines()

# We want to inspect around line 384-388
print("Original 384:", lines[384])
print("Original 385:", lines[385])
print("Original 386:", lines[386])

# Let's replace from index 384 to 386
lines[384] = '        <p className="text-sm text-slate-400 leading-relaxed">'
lines[385] = '          هذا القسم يوفر واجهة مستخدم تفاعلية (Simulator) لتجربة منطق الحساب البرمجي وعرض شفرة أندرويد (Kotlin) المتكاملة.'
lines[386] = '''        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Mobile Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-4 border-4 border-slate-700 shadow-2xl relative overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-700 rounded-b-xl z-20"></div>
            <div className="bg-slate-100 rounded-2xl p-4 pt-6 min-h-[580px] space-y-4 relative">
                {/* Sub-navigation inside the simulated phone */}'''

new_content = '\n'.join(lines)
with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement done successfully!")
