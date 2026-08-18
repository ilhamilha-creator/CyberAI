# CyberAI-Expert Frontend Charts Components

## 📊 Available Components

### 1. **RealTimeDashboard** 
- **Purpose**: Main security dashboard with real-time metrics
- **Features**: KPI cards, alert timeline, system performance, distribution charts
- **Charts**: Area, Line, Pie, Bar charts using Recharts
- **Updates**: Every 5 seconds

### 2. **AttackMap**
- **Purpose**: Global threat visualization
- **Features**: Geographic attack locations, severity indicators, threat counts
- **Data**: Mock coordinates with real attack patterns
- **Interactive**: Click to view details

### 3. **AIModels**
- **Purpose**: ML model performance monitoring
- **Features**: Model accuracy, training status, prediction counts
- **Models**: Random Forest, XGBoost, LSTM, Autoencoder
- **Actions**: Retrain, performance analysis

### 4. **MitreMatrix**
- **Purpose**: MITRE ATT&CK framework visualization
- **Features**: 12 tactics matrix, technique mapping, severity colors
- **Interactive**: Click tactics for detailed techniques
- **Coverage**: Real-time attack pattern analysis

### 5. **NetworkChart**
- **Purpose**: Network traffic monitoring
- **Features**: Bandwidth usage, packet rates, connection table
- **Charts**: Multi-line charts with time ranges
- **Real-time**: 15-second updates

### 6. **ThreatHunting**
- **Purpose**: Advanced threat investigation
- **Features**: Threat cards, search/filter, IOC indicators
- **Actions**: Investigate, block IP, detailed analysis
- **Risk Scoring**: Dynamic risk assessment

### 7. **AIAssistant**
- **Purpose**: Interactive security chatbot
- **Features**: Real-time chat, confidence scores, context awareness
- **Responses**: Security analysis, recommendations, threat intel
- **Interface**: Modern chat UI with typing indicators

### 8. **ThreeDVisualization**
- **Purpose**: 3D network topology visualization
- **Features**: Interactive 3D nodes, connections, threat visualization
- **Technology**: React Three Fiber, WebGL
- **Controls**: Rotate, zoom, pan, node interaction

## 🎨 Design System

### **Colors**
- Primary: `#64ffda` (Cyan)
- Secondary: `#00b4d8` (Blue)
- Tertiary: `#7c3aed` (Purple)
- Critical: `#ff2d55` (Red)
- High: `#ff6b35` (Orange)
- Medium: `#ffa62b` (Yellow)
- Low: `#00b4d8` (Blue)

### **Components**
- Glass morphism effects
- Neon glow animations
- Smooth transitions
- Responsive grid layouts

### **Typography**
- Display: Bebas Neue
- Mono: IBM Plex Mono
- Body: DM Sans

## 📱 Responsive Design

- **Mobile**: < 768px - Stacked layouts
- **Tablet**: 768px - 1024px - Adjusted grids
- **Desktop**: > 1024px - Full layouts

## ⚡ Performance

- **Lazy Loading**: Routes loaded on demand
- **Debounced Updates**: Prevent excessive re-renders
- **Optimized Charts**: Efficient data processing
- **Memory Management**: Proper cleanup in useEffect

## 🔧 Usage

```jsx
import { RealTimeDashboard, AttackMap, AIModels } from '../components/charts'

// Use in routes
<Route path="/dashboard" element={<RealTimeDashboard />} />
<Route path="/attack-map" element={<AttackMap />} />
<Route path="/ai" element={<AIModels />} />
```

## 🚀 Future Enhancements

- [ ] WebSocket integration for real-time data
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements
- [ ] Mobile gesture support
